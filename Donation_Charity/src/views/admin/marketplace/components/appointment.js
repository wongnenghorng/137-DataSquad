// src/views/admin/Appointment.js
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Input, FormLabel, FormControl, Grid,
  Heading, Table, Thead, Tbody, Tr, Th, Td,
  Alert, AlertIcon, Select, InputGroup, InputLeftAddon
} from '@chakra-ui/react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { createAppointment } from '../../../../graphql/mutations';
import { listAppointments as listAppointmentsQuery, listDonations } from '../../../../graphql/queries';

const REGION = 'ap-southeast-1';
const BUCKET = 'donationcharity54de4e5ca47d445dbc8135e7c4d74ece85160-dev';

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    AWS_ACCESS_KEY = process.env.REACT_APP_AWS_ACCESS_KEY;
     AWS_SECRET_KEY = process.env.REACT_APP_AWS_SECRET_KEY;
  },
});

const getS3ImageUrl = (bucket, region, key) =>
  `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

const client = generateClient();

export default function Appointment() {
  const [formData, setFormData] = useState({
    name: '', ic: '', age: '', householdIncome: '',
    householdSize: '', isOku: '', evidencePhoto: '',
    amountNeeded: '', purpose: '', email: '',
  });
  const [appointments, setAppointments] = useState([]);
  const [donationMap, setDonationMap] = useState({});
  const [file, setFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const fetchAppointments = async () => {
    try {
      const res = await client.graphql({
        query: listAppointmentsQuery,
        variables: {
          filter: { email: { eq: userEmail } }
        }
      });
      setAppointments(res.data.listAppointments.items);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const fetchDonations = async () => {
    try {
      const res = await client.graphql({ query: listDonations });
      const donations = res.data.listDonations.items;
      const map = {};

      donations.forEach((donation) => {
        const receiver = donation.ReceiverName?.trim();
        const amount = parseFloat(donation.DonateAmount || 0);

        if (!receiver) return;

        if (map[receiver]) {
          map[receiver] += amount;
        } else {
          map[receiver] = amount;
        }
      });

      setDonationMap(map);
    } catch (err) {
      console.error('❌ Error fetching donations:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'ic' && value.length > 12) return;
    if (['age', 'householdSize', 'householdIncome', 'amountNeeded'].includes(name) && isNaN(value)) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) setFile(uploadedFile);
  };

  const uploadImageToS3 = async (file) => {
    const key = `evidencePhotos/${Date.now()}-${file.name}`;
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: await file.arrayBuffer(),
      ContentType: file.type,
    });
    await s3Client.send(command);
    return getS3ImageUrl(BUCKET, REGION, key);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['name', 'ic', 'age', 'householdIncome', 'householdSize', 'isOku', 'amountNeeded', 'purpose'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Missing value for: ${field}`);
        return;
      }
    }

    try {
      const photoUrl = file ? await uploadImageToS3(file) : '';

      const fullData = {
        ...formData,
        email: userEmail,
        evidencePhoto: photoUrl,
        status: 'Pending'
      };

      await client.graphql({
        query: createAppointment,
        variables: { input: fullData },
      });

      setSuccessMessage('Appointment created successfully!');
      setFormData({
        name: '', ic: '', age: '', householdIncome: '',
        householdSize: '', isOku: '', evidencePhoto: '',
        amountNeeded: '', purpose: '', email: userEmail,
      });
      setFile(null);
      fetchAppointments();
      fetchDonations();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('❌ Create error:', err);
      setSuccessMessage('Error creating appointment');
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        const email = user?.signInDetails?.loginId;
        setUserEmail(email);
      } catch (err) {
        console.error('Get user failed:', err);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (userEmail) {
      fetchAppointments();
      fetchDonations();
    }
  }, [userEmail]);

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Donation Request</Heading>

      {successMessage && (
        <Alert status="success" mb={4}>
          <AlertIcon />
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} mb={6}>
          <FormControl><FormLabel>Full Name</FormLabel><Input name="name" value={formData.name} onChange={handleChange} required /></FormControl>
          <FormControl><FormLabel>IC Number (12 digits)</FormLabel><Input name="ic" value={formData.ic} maxLength={12} onChange={handleChange} required /></FormControl>
          <FormControl><FormLabel>Age</FormLabel><Input type="number" name="age" value={formData.age} onChange={handleChange} required /></FormControl>
          <FormControl><FormLabel>Household Income (RM)</FormLabel><InputGroup><InputLeftAddon>RM</InputLeftAddon><Input type="number" name="householdIncome" value={formData.householdIncome} onChange={handleChange} required /></InputGroup></FormControl>
          <FormControl><FormLabel>Household Size</FormLabel><Input type="number" name="householdSize" value={formData.householdSize} onChange={handleChange} required /></FormControl>
          <FormControl><FormLabel>Is OKU</FormLabel><Select name="isOku" value={formData.isOku} onChange={handleChange} placeholder="Select" required><option value="YES">YES</option><option value="NO">NO</option></Select></FormControl>
          <FormControl><FormLabel>Evidence Photo</FormLabel><Input type="file" accept="image/*" onChange={handleFileChange} /></FormControl>
          <FormControl><FormLabel>Amount Needed (RM)</FormLabel><InputGroup><InputLeftAddon>RM</InputLeftAddon><Input type="number" name="amountNeeded" value={formData.amountNeeded} onChange={handleChange} required /></InputGroup></FormControl>
          <FormControl><FormLabel>Purpose</FormLabel><Select name="purpose" value={formData.purpose} onChange={handleChange} placeholder="Select" required><option value="medical">Medical</option><option value="education">Education</option><option value="Emergency Use">Emergency Use</option><option value="Basic Need">Basic Need</option><option value="House Repair">House Repair</option><option value="Orphans & Single Mothers">Orphans & Single Mothers</option><option value="Micro Business">Micro Business</option></Select></FormControl>
        </Grid>
        <Button type="submit" colorScheme="teal" width="full">Submit Request</Button>
      </form>

      <Heading size="md" mt={10} mb={4}>Donation Request List</Heading>
      <Box overflowX="auto">
        <Table variant="striped" colorScheme="gray">
          <Thead>
            <Tr>
              <Th>Name</Th><Th>IC</Th><Th>Age</Th><Th>Income</Th><Th>Household Size</Th><Th>OKU</Th>
              <Th>Amount</Th><Th>Purpose</Th><Th>Evidence</Th><Th>Amount Received</Th><Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {appointments.map((a) => (
              <Tr key={a.id}>
                <Td>{a.name}</Td>
                <Td>{a.ic}</Td>
                <Td>{a.age}</Td>
                <Td>RM {a.householdIncome}</Td>
                <Td>{a.householdSize}</Td>
                <Td>{a.isOku}</Td>
                <Td>RM {a.amountNeeded}</Td>
                <Td>{a.purpose}</Td>
                <Td>{a.evidencePhoto ? (
                    <a
                      href={a.evidencePhoto}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#319795',
                        textDecoration: 'underline',
                        fontWeight: 'bold',
                      }}
                    >
                      View
                    </a>
                  ) : 'No Image'}
                </Td>
                <Td>RM {donationMap[a.name]?.toFixed(2) || '0.00'}</Td>
                <Td>{a.status || 'Pending'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
