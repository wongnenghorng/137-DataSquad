// src/views/admin/HistoryList.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
  Spinner,
} from '@chakra-ui/react';
import { generateClient } from 'aws-amplify/api';
import { listAppointments } from '../../../../graphql/queries';

const client = generateClient();

export default function HistoryListPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const result = await client.graphql({ query: listAppointments });
      setAppointments(result.data.listAppointments.items || []);
    } catch (error) {
      console.error('Error fetching appointment history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>Appointment History</Heading>

      {loading ? (
        <Spinner size="lg" />
      ) : (
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
                  ) : (
                    'No Image'
                  )}
                </Td>
                <Td>{a.status || 'Pending'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
