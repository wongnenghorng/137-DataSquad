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
  Button,
} from '@chakra-ui/react';
import * as React from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Card from 'components/card/Card';
import { generateClient } from 'aws-amplify/api';
import { listDonationCampaigns } from 'graphql/queries';

const columnHelper = createColumnHelper();

export default function CheckTable() {
  const [donationCampaigns, setDonationCampaigns] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [pageIndex, setPageIndex] = React.useState(0);
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const client = generateClient();
        const res = await client.graphql({ query: listDonationCampaigns });
        setDonationCampaigns(res.data.listDonationCampaigns.items || []);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      }
    };
    fetchData();
  }, []);

  const columns = [
    columnHelper.accessor('index', {
      id: 'index',
      header: () => <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">No</Text>,
      cell: (info) => (
        <Text color={textColor} fontSize="sm" fontWeight="700">
          {info.row.index + 1 + pageIndex * 7}
        </Text>
      ),
    }),
    columnHelper.accessor('donorName', {
      id: 'donorName',
      header: () => <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">Donor Name</Text>,
      cell: (info) => <Text color={textColor} fontSize="sm" fontWeight="700">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('donateAmount', {
      id: 'donateAmount',
      header: () => <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">Amount</Text>,
      cell: (info) => <Text color={textColor} fontSize="sm" fontWeight="700">RM {parseFloat(info.getValue() || 0).toFixed(2)}</Text>,
    }),
    columnHelper.accessor('title', {
      id: 'title',
      header: () => <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">Title</Text>,
      cell: (info) => <Text color={textColor} fontSize="sm" fontWeight="700">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('tx_hash', {
      id: 'tx_hash',
      header: () => <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">Tx Hash</Text>,
      cell: (info) => <Text color={textColor} fontSize="sm" fontWeight="700">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('contractAddress', {
      id: 'contractAddress',
      header: () => <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">Contract Address</Text>,
      cell: (info) => <Text color={textColor} fontSize="sm" fontWeight="700">{info.getValue()}</Text>,
    }),
    columnHelper.accessor('createdAt', {
      id: 'createdAt',
      header: () => <Text fontSize={{ sm: '10px', lg: '12px' }} color="gray.400">Created At</Text>,
      cell: (info) => {
        const date = new Date(info.getValue());
        return <Text color={textColor} fontSize="sm" fontWeight="700">{date.toLocaleString()}</Text>;
      },
    }),
  ];

  const table = useReactTable({
    data: donationCampaigns,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const paginatedRows = table.getSortedRowModel().rows.slice(
    pageIndex * 7,
    pageIndex * 7 + 7
  );

  return (
    <Card flexDirection="column" w="100%" px="0px" overflowX={{ sm: 'scroll', lg: 'hidden' }}>
      <Flex px="25px" mb="8px" justifyContent="space-between" align="center">
        <Text color={textColor} fontSize="22px" fontWeight="700" lineHeight="100%">
          Campaign Personal Donation Transaction List
        </Text>
      </Flex>
      <Box>
        <Table variant="simple" color="gray.500" mb="24px" mt="12px">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th
                    key={header.id}
                    colSpan={header.colSpan}
                    pe="10px"
                    borderColor={borderColor}
                    cursor="pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <Flex justifyContent="space-between" align="center">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: '', desc: '' }[header.column.getIsSorted()] ?? null}
                    </Flex>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {paginatedRows.map((row) => (
              <Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Td
                    key={cell.id}
                    fontSize={{ sm: '14px' }}
                    minW={{ sm: '150px', md: '200px', lg: 'auto' }}
                    borderColor="transparent"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
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
                prev + 1 < Math.ceil(donationCampaigns.length / 7) ? prev + 1 : prev
              )
            }
            isDisabled={pageIndex + 1 >= Math.ceil(donationCampaigns.length / 7)}
          >
            Next
          </Button>
        </Flex>
      </Box>
    </Card>
  );
}
