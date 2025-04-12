import {
  Box,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Button,
  Spinner,
} from '@chakra-ui/react';
import Card from 'components/card/Card';
import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listDonations } from 'graphql/queries';

export default function DonationTable() {
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const client = generateClient();
        const res = await client.graphql({ query: listDonations });
        const sorted = res.data.listDonations.items.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setDonations(sorted);
      } catch (err) {
        console.error('Error fetching donations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const paginatedDonations = donations.slice(
    pageIndex * rowsPerPage,
    pageIndex * rowsPerPage + rowsPerPage,
  );

  return (
    <Card
      flexDirection="column"
      w="100%"
      px="0px"
      overflowX={{ sm: 'scroll', lg: 'hidden' }}
    >
      <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
        <Text color={textColor} fontSize="22px" fontWeight="700">
          Personal Donation Transaction List
        </Text>
      </Flex>
      {loading ? (
        <Flex justifyContent="center" py={10}>
          <Spinner size="lg" />
        </Flex>
      ) : (
        <>
          <Table variant="simple" color="gray.500" mb="24px" mt="12px">
            <Thead>
              <Tr>
                <Th color="gray.400" fontSize="12px">
                  No
                </Th>
                <Th color="gray.400" fontSize="12px">
                  Donor Name
                </Th>
                <Th color="gray.400" fontSize="12px">
                  Amount
                </Th>
                <Th color="gray.400" fontSize="12px">
                  Receiver
                </Th>
                <Th color="gray.400" fontSize="12px">
                  Created At
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedDonations.map((donation, index) => (
                <Tr key={donation.id}>
                  <Td fontWeight="700" fontSize="sm">
                    {index + 1 + pageIndex * rowsPerPage}
                  </Td>
                  <Td fontSize="sm">{donation.DonorName}</Td>
                  <Td fontSize="sm">
                    RM {parseFloat(donation.DonateAmount || 0).toFixed(2)}
                  </Td>
                  <Td fontSize="sm">{donation.ReceiverName}</Td>
                  <Td fontSize="sm">
                    {new Date(donation.createdAt).toLocaleString()}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Flex justifyContent="center" gap="10px" mb="24px">
            <Button
              size="sm"
              onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
              isDisabled={pageIndex === 0}
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={() =>
                setPageIndex((prev) =>
                  prev + 1 < Math.ceil(donations.length / rowsPerPage)
                    ? prev + 1
                    : prev,
                )
              }
              isDisabled={
                pageIndex + 1 >= Math.ceil(donations.length / rowsPerPage)
              }
            >
              Next
            </Button>
          </Flex>
        </>
      )}
    </Card>
  );
}