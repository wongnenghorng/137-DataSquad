import React, { useEffect, useState } from 'react';
import { listDonations } from '../../../graphql/queries'; // ✅ 确保路径正确
import { generateClient } from 'aws-amplify/api';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  Box,
  Spinner,
  Text,
} from '@chakra-ui/react';

const client = generateClient();

export default function PersonalDonationPage() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = async () => {
    try {
      const response = await client.graphql({
        query: listDonations,
      });

      const rawItems = response.data.listDonations.items;
      console.log("All donations:", rawItems);

      // 过滤掉 createdAt 或 updatedAt 为 null 的记录
      const validItems = rawItems.filter(
        (item) => item.createdAt !== null && item.updatedAt !== null
      );

      // ✅ 按照 createdAt 从最新到最旧排序
      const sortedItems = validItems.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setDonations(sortedItems);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching donations:", error);
      if (error.errors) {
        console.error("GraphQL Errors:", error.errors);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  return (
    <Box p={6}>
      <Heading mb={4}>Personal Donation List</Heading>
      {loading ? (
        <Spinner size="xl" />
      ) : donations.length === 0 ? (
        <Text>No valid donation records found.</Text>
      ) : (
        <TableContainer>
          <Table variant="striped" colorScheme="teal">
            <Thead>
              <Tr>
                <Th>No.</Th>
                <Th>Donor Name</Th>
                <Th>Amount</Th>
                <Th>Receiver</Th>
                <Th>Created At</Th>
              </Tr>
            </Thead>
            <Tbody>
              {donations.map((donation, index) => (
                <Tr key={donation.id}>
                  <Td>{index + 1}</Td>
                  <Td>{donation.DonorName}</Td>
                  <Td>RM {donation.DonateAmount}</Td>
                  <Td>{donation.ReceiverName}</Td>
                  <Td>{new Date(donation.createdAt).toLocaleString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
