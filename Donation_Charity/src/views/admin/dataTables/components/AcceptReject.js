// src/views/admin/AcceptReject.js
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Table, Thead, Tbody, Tr, Th, Td,
  Heading, Alert, AlertIcon, Link, Flex, Spacer
} from '@chakra-ui/react';
import { generateClient } from 'aws-amplify/api';
import { listAppointments } from '../../../../graphql/queries';
import { updateAppointment } from '../../../../graphql/mutations';

const client = generateClient();
const ITEMS_PER_PAGE = 10;

export default function AcceptRejectPage() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);

  const fetchAppointments = async () => {
    try {
      const result = await client.graphql({ query: listAppointments });
      const all = result.data.listAppointments.items;
      const pending = all.filter(item => item.status === 'Pending' || !item.status);
      setAppointments(pending);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await client.graphql({
        query: updateAppointment,
        variables: { input: { id, status } },
      });
      setMessage(`Status updated to ${status}`);
      fetchAppointments(); // refresh list
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage('Failed to update status');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const startIdx = (page - 1) * ITEMS_PER_PAGE;
  const paginated = appointments.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Manage Appointments (Admin Only)</Heading>

      {message && (
        <Alert status="info" mb={4}><AlertIcon />{message}</Alert>
      )}

      <Table variant="striped" colorScheme="gray" size="sm">
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

      {/* Pagination Controls */}
      <Flex justify="center" mt={4}>
        <Button
          size="sm"
          onClick={() => setPage(page - 1)}
          isDisabled={page <= 1}
          mr={2}
        >
          Previous
        </Button>
        <Button
          size="sm"
          onClick={() => setPage(page + 1)}
          isDisabled={page >= totalPages}
        >
          Next
        </Button>
      </Flex>
    </Box>
  );
}
