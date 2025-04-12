import {
  Flex,
  Box,
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
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { generateClient } from "aws-amplify/api";
import { listDonationCampaigns } from "graphql/queries";
import Card from "components/card/Card";

const columnHelper = createColumnHelper();

export default function CheckTable() {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");

  const [donations, setDonations] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState([]);
  const [pageIndex, setPageIndex] = React.useState(0);

  const rowsPerPage = 5;

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const client = generateClient();
        const res = await client.graphql({ query: listDonationCampaigns });
        const items = res.data.listDonationCampaigns.items || [];

        // ✅ Sort by createdAt descending (newest first)
        const sorted = [...items].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setDonations(sorted);
      } catch (err) {
        console.error("❌ Error fetching donations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    columnHelper.accessor("donorName", {
      id: "donorName",
      header: () => <Text color="gray.400">Donor Name</Text>,
      cell: (info) => (
        <Text color={textColor} isTruncated maxW="120px" textAlign="left">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("donateAmount", {
      id: "donateAmount",
      header: () => <Text color="gray.400">Donate Amount</Text>,
      cell: (info) => (
        <Text color={textColor} isTruncated maxW="120px" textAlign="left">
          RM {parseFloat(info.getValue() || 0).toFixed(2)}
        </Text>
      ),
    }),
    columnHelper.accessor("title", {
      id: "title",
      header: () => <Text color="gray.400">Title</Text>,
      cell: (info) => (
        <Text color={textColor} isTruncated maxW="160px" textAlign="left">
          {info.getValue()}
        </Text>
      ),
    }),
    columnHelper.accessor("tx_hash", {
      id: "tx_hash",
      header: () => <Text color="gray.400">Prove</Text>,
      cell: (info) => {
        const hash = info.getValue();
        const url = `https://sepolia.etherscan.io/tx/${hash}`;
        return (
          <Text
            as="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            color="blue.500"
            fontWeight="600"
            _hover={{ textDecoration: "underline" }}
            isTruncated
            maxW="100px"
            textAlign="left"
          >
            View
          </Text>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      id: "createdAt",
      header: () => <Text color="gray.400">Created At</Text>,
      cell: (info) => {
        const d = new Date(info.getValue());
        return (
          <Text color={textColor} isTruncated maxW="160px" textAlign="left">
            {d.toLocaleString()}
          </Text>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: donations,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const paginatedRows = table.getSortedRowModel().rows.slice(
    pageIndex * rowsPerPage,
    pageIndex * rowsPerPage + rowsPerPage
  );

  return (
    <Card flexDirection="column" w="100%" px="0px" overflowX="auto">
      <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
        <Text color={textColor} fontSize="22px" fontWeight="700">
          Campaign Personal Donation List
        </Text>
      </Flex>

      {loading ? (
        <Flex justify="center" align="center" py={10}>
          <Spinner size="xl" />
        </Flex>
      ) : donations.length === 0 ? (
        <Text textAlign="center" py={10}>
          No donation data found.
        </Text>
      ) : (
        <>
          <Box>
            <Table variant="simple" color="gray.500" mb="24px" mt="12px">
              <Thead>
                <Tr>
                  <Th color="gray.400">No</Th>
                  {table.getHeaderGroups()[0].headers.map((header) => (
                    <Th
                      key={header.id}
                      pe="10px"
                      borderColor={borderColor}
                      cursor="pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <Flex justify="space-between" align="center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{ asc: "", desc: "" }[header.column.getIsSorted()] ?? null}
                      </Flex>
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {paginatedRows.map((row, rowIndex) => (
                  <Tr key={row.id}>
                    <Td
                      fontWeight="700"
                      minW="60px"
                      maxW="60px"
                      whiteSpace="nowrap"
                      textAlign="left"
                    >
                      {rowIndex + 1 + pageIndex * rowsPerPage}
                    </Td>
                    {row.getVisibleCells().map((cell) => (
                      <Td
                        key={cell.id}
                        fontSize={{ sm: "14px" }}
                        minW="120px"
                        maxW="180px"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        borderColor="transparent"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
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
                  prev + 1 < Math.ceil(donations.length / rowsPerPage)
                    ? prev + 1
                    : prev
                )
              }
              isDisabled={pageIndex + 1 >= Math.ceil(donations.length / rowsPerPage)}
            >
              Next
            </Button>
          </Flex>
        </>
      )}
    </Card>
  );
}
