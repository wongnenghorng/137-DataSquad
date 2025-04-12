/* eslint-disable */
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
  Spinner,
  Button,
} from "@chakra-ui/react";
import * as React from "react";
import { generateClient } from "aws-amplify/api";
import { listCampaignSpendings } from "graphql/queries";
import Card from "components/card/Card";

export default function CampaignSpendingTable() {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  const [spendings, setSpendings] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [pageIndex, setPageIndex] = React.useState(0);

  const rowsPerPage = 5;

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const client = generateClient();
        const res = await client.graphql({ query: listCampaignSpendings });
        const items = res.data.listCampaignSpendings.items || [];

        // ✅ Sort by createdAt descending (newest first)
        const sorted = [...items].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setSpendings(sorted);
      } catch (err) {
        console.error("❌ Error fetching spendings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const paginatedSpendings = spendings.slice(
    pageIndex * rowsPerPage,
    pageIndex * rowsPerPage + rowsPerPage
  );

  return (
    <Card flexDirection="column" w="100%" px="0px" overflowX="auto">
      <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
        <Text color={textColor} fontSize="22px" fontWeight="700">
          Campaign Fund Allocation
        </Text>
      </Flex>

      {loading ? (
        <Flex justify="center" align="center" py={10}>
          <Spinner size="xl" />
        </Flex>
      ) : spendings.length === 0 ? (
        <Text textAlign="center" py={10}>No spending records found.</Text>
      ) : (
        <>
          <Box>
            <Table variant="simple" color="gray.500" mb="24px" mt="12px">
              <Thead>
                <Tr>
                  <Th>No</Th>
                  <Th>Campaign Name</Th>
                  <Th>Spend By</Th>
                  <Th>Amount</Th>
                  <Th>Receipt</Th>
                  <Th>Prove</Th>
                  <Th>Created At</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedSpendings.map((item, index) => (
                  <Tr key={item.id}>
                    <Td>{index + 1 + pageIndex * rowsPerPage}</Td>
                    <Td>{item.campaignName}</Td>
                    <Td>{item.spendPeopleName}</Td>
                    <Td>RM {parseFloat(item.spendAmount || 0).toFixed(2)}</Td>
                    <Td>
                      {item.receiptPic ? (
                        <Text
                          as="a"
                          href={item.receiptPic}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="blue.500"
                          fontWeight="600"
                          _hover={{ textDecoration: "underline" }}
                        >
                          View
                        </Text>
                      ) : (
                        "No Image"
                      )}
                    </Td>
                    <Td>
                      {item.tx_hash ? (
                        <Text
                          as="a"
                          href={`https://sepolia.etherscan.io/tx/${item.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="blue.500"
                          fontWeight="600"
                          _hover={{ textDecoration: "underline" }}
                        >
                          View
                        </Text>
                      ) : (
                        "-"
                      )}
                    </Td>
                    <Td>{new Date(item.createdAt).toLocaleString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* ✅ Pagination Controls */}
          <Flex justify="center" gap="10px" mb="24px">
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
                  prev + 1 < Math.ceil(spendings.length / rowsPerPage) ? prev + 1 : prev
                )
              }
              isDisabled={pageIndex + 1 >= Math.ceil(spendings.length / rowsPerPage)}
            >
              Next
            </Button>
          </Flex>
        </>
      )}
    </Card>
  );
}
