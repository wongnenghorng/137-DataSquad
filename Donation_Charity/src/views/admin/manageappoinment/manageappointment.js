import React, { useEffect, useState } from 'react';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Alert, AlertIcon, Link, Spinner, Flex
} from '@chakra-ui/react';
import { generateClient } from 'aws-amplify/api';
import { listAppointments } from '../../../graphql/queries';
import { updateAppointment } from '../../../graphql/mutations';

const client = generateClient();
const ITEMS_PER_PAGE = 10;

export default function ManageAppointmentPage() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchAppointments = async () => {
    try {
      const result = await client.graphql({ query: listAppointments });
      const all = result.data.listAppointments.items || [];
      setAppointments(all);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await client.graphql({
        query: updateAppointment,
        variables: { input: { id, status } },
      });
      setMessage(`Status updated to ${status}`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage('Failed to update status');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const pendingAppointments = appointments.filter(item => item.status === 'Pending' || !item.status);
  const startIdx = (page - 1) * ITEMS_PER_PAGE;
  const paginated = pendingAppointments.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(pendingAppointments.length / ITEMS_PER_PAGE);

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Manage Appointments (Admin Only)</Heading>

      {message && (
        <Alert status="info" mb={4}><AlertIcon />{message}</Alert>
      )}

      {/* ✅ Accept / Reject Table */}
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <>
          <Table variant="striped" colorScheme="gray" size="sm" mb={6}>
            <Thead>
              <Tr>
                <Th>No</Th>
                <Th>Name</Th>
                <Th>IC</Th>
                <Th>Age</Th>
                <Th>Income</Th>
                <Th>Size</Th>
                <Th>OKU</Th>
                <Th>Amount</Th>
                <Th>Purpose</Th>
                <Th>Evidence</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginated.map((app, index) => (
                <Tr key={app.id}>
                  <Td>{startIdx + index + 1}</Td>
                  <Td>{app.name}</Td>
                  <Td>{app.ic}</Td>
                  <Td>{app.age}</Td>
                  <Td>RM {app.householdIncome}</Td>
                  <Td>{app.householdSize}</Td>
                  <Td>{app.isOku}</Td>
                  <Td>RM {app.amountNeeded}</Td>
                  <Td>{app.purpose}</Td>
                  <Td>
                    <Link href={app.evidencePhoto} target="_blank" color="teal.500">
                      View
                    </Link>
                  </Td>
                  <Td>{app.status || 'Pending'}</Td>
                  <Td>
                    <Button size="xs" colorScheme="green" mr={1}
                      onClick={() => handleStatusChange(app.id, 'Accepted')}>
                      Accept
                    </Button>
                    <Button size="xs" colorScheme="red"
                      onClick={() => handleStatusChange(app.id, 'Rejected')}>
                      Reject
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {/* Pagination */}
          <Flex justify="center" mt={2} mb={10}>
            <Button size="sm" mr={2} onClick={() => setPage(page - 1)} isDisabled={page <= 1}>Previous</Button>
            <Button size="sm" onClick={() => setPage(page + 1)} isDisabled={page >= totalPages}>Next</Button>
          </Flex>
        </>
      )}

      {/* ✅ History Table */}
      <Heading size="md" mt={10} mb={4}>Appointment History</Heading>
      <Table variant="striped" colorScheme="gray" size="sm">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>IC</Th>
            <Th>Age</Th>
            <Th>Income</Th>
            <Th>Size</Th>
            <Th>OKU</Th>
            <Th>Amount</Th>
            <Th>Purpose</Th>
            <Th>Evidence</Th>
            <Th>Status</Th>
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
              <Td>
                {a.evidencePhoto ? (
                  <Link href={a.evidencePhoto} target="_blank" color="teal.500">
                    View
                  </Link>
                ) : 'No Image'}
              </Td>
              <Td>{a.status || 'Pending'}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
