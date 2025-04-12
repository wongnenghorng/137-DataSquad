import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
  Text,
  Spinner,
  Card,
  SimpleGrid,
  CardBody,
  CardHeader,
  TabPanels,
  TabPanel,
  TabList,
  Tab,
  Tabs,
} from '@chakra-ui/react';
import { generateClient } from 'aws-amplify/api';
import {
  createCampaign,
  updateCampaign,
  createDonationCampaign,
} from 'graphql/mutations';
import {
  listCampaigns as listCampaignsQuery,
  listProfiles,
} from 'graphql/queries';
import { getCurrentUser } from 'aws-amplify/auth';
import axios from 'axios';
import { graphql } from 'graphql';
import { listDonationCampaigns } from 'graphql/queries';
import { createCampaignSpending } from 'graphql/mutations';
import { ConsoleLogger } from 'aws-amplify/utils';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const client = generateClient();

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

const uploadReceiptToS3 = async (file) => {
  const key = `receiptProofs/${Date.now()}-${file.name}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: await file.arrayBuffer(),
    ContentType: file.type,
  });

  await s3Client.send(command);
  return getS3ImageUrl(BUCKET, REGION, key);
};

const API_BASE =
  'https://testnet111-aqa8fjfhf6a6c7c5.southeastasia-01.azurewebsites.net/contract/';
const Campaign = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [campaigns, setCampaigns] = useState([]);
  const [donationCampaign, setDonationCampaign] = useState([]);
  const [bcCampaigns, setBCCampaigns] = useState([]);
  const [organizerName, setOrganizerName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    contractAddress: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDonations = donationCampaign.slice(startIndex, endIndex);

  const totalPages = Math.ceil(donationCampaign.length / itemsPerPage);

  const {
    isOpen: isDonationModalOpen,
    onOpen: onDonationModalOpen,
    onClose: onDonationModalClose,
  } = useDisclosure();

  const {
    isOpen: isSpendingModalOpen,
    onOpen: onSpendingModalOpen,
    onClose: onSpendingModalClose,
  } = useDisclosure();

  const [activeDonations, setActiveDonations] = useState([]);
  const [activeSpendings, setActiveSpendings] = useState([]);

  const [loading, setLoading] = useState(false);
  const {
    isOpen: isLogSpendingOpen,
    onOpen: onLogSpendingOpen,
    onClose: onLogSpendingClose,
  } = useDisclosure();

  const [spendingCampaign, setSpendingCampaign] = useState(null);
  const [spendFormModal, setSpendFormModal] = useState({
    description: '',
    amount: '',
    receiptFile: null,
    campaignAddress: '',
    receiptHash: '',
    title: '',
  });

  const fetchCampaigns = async () => {
    const res = await client.graphql({ query: listCampaignsQuery });
    setCampaigns(res.data.listCampaigns.items);
  };

  const fetchDonations = async () => {
    const res = await client.graphql({ query: listDonationCampaigns });
    setDonationCampaign(res.data.listDonationCampaigns.items);
  };

  const fetchUserProfile = async () => {
    const user = await getCurrentUser();
    const email = user.signInDetails?.loginId;

    const res = await client.graphql({
      query: listProfiles,
      variables: {
        filter: { email: { eq: email } },
      },
    });

    const profile = res.data.listProfiles.items[0];
    if (profile) {
      setOrganizerName(profile.name);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSpendingFormChange = (e) => {
    setSpendFormModal({
      ...spendFormModal, // Spread the previous state to keep other values intact
      [e.target.name]: e.target.value, // Dynamically set the name based on the input field
    });
  };

  const handleFileChange = (e) => {
    setSpendFormModal({
      ...spendFormModal,
      receiptFile: e.target.files[0], // Update only the receiptFile
    });
  };

  const handleCreate = async () => {
    setLoading(true);
    const response = await axios.post(
      'https://testnet111-aqa8fjfhf6a6c7c5.southeastasia-01.azurewebsites.net/contract/create',
      {
        title: formData.title,
        category: formData.category,
        organizerName: organizerName,
      },
    );

    console.log(response);

    if (!response.data.txHash && !response.data.message) {
      console.log('create error');
      setLoading(false);
      return;
    }

    await client.graphql({
      query: createCampaign,
      variables: {
        input: {
          ...formData,
          organizerName: organizerName,
          status: 'In Progress',
          contractAddress:
            response.data.newCampaignAddress ?? response.data.txHash,
        },
      },
    });
    onClose();
    fetchCampaigns();
    fetchBCCampaigns();
    setLoading(false);
  };

  // Spend
  const handleSpend = async (e) => {
    e.preventDefault();
    try {
      let receiptUrl = '';
      if (spendFormModal.receiptFile) {
        receiptUrl = await uploadReceiptToS3(spendFormModal.receiptFile);
      }
      console.log(spendFormModal);
      const res = await axios.post(`${API_BASE}/spend`, spendFormModal);
      alert('Spending logged! Tx: ' + res.data.txHash);
      await client.graphql({
        query: createCampaignSpending,
        variables: {
          input: {
            spendPeopleName: organizerName,
            spendAmount: spendFormModal.amount,
            tx_hash: res.data.txHash,
            contractAddress: spendFormModal.campaignAddress,
            description: spendFormModal.description,
            campaignName: spendFormModal.title,
            receiptPic: receiptUrl,
          },
        },
      });
      onLogSpendingClose();
    } catch (error) {
      console.error('❌ Upload or Log Spending Error:', error);
      alert('Something went wrong during spending log.');
    }
  };

  const handleStop = async (id) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (campaign) {
      await client.graphql({
        query: updateCampaign,
        variables: {
          input: {
            id: campaign.id,
            status: 'Stopped',
          },
        },
      });
      fetchCampaigns();
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchUserProfile();
    fetchBCCampaigns();
    fetchDonations();
  }, []);

  const fetchBCCampaigns = async () => {
    const res = await axios.get(`${API_BASE}/campaigns`);
    setBCCampaigns(res.data.campaigns);
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box p={5}>
      <Heading size="md" mb={3}>
        Campaigns
      </Heading>

      <Button colorScheme="teal" onClick={onOpen} mb={5}>
        Create Campaign
      </Button>

      <Heading size="md" mb={4}>
        📋 Campaign Briefs
      </Heading>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5}>
        {campaigns.map((c) => (
          <Card key={c.id} p={4} shadow="md" cursor="default">
            <CardHeader fontWeight="bold" fontSize="lg">
              {c.title}
            </CardHeader>
            <CardBody>
              <Text>
                <strong>Description:</strong> {c.description}
              </Text>
              <Text>
                <strong>Category:</strong> {c.category}
              </Text>
              <Text
                fontWeight="bold"
                fontSize="sm"
                color={c.status === 'Stopped' ? 'red.500' : 'green.600'}
              >
                Status: {c.status}
              </Text>
              <Text>
                <strong>Organizer:</strong> {c.organizerName}
              </Text>
              <Box
                as="a"
                href={`https://sepolia.etherscan.io/address/${c.contractAddress}`}
                target="_blank"
                color="blue.500"
              >
                Proof
              </Box>

              <Flex mt={4} gap={3}>
                <Button
                  size="sm"
                  fontSize="xs" // ✅ 字体变小
                  px="10px"     // ✅ 按钮左右间距小一点
                  colorScheme="blue"
                  onClick={async () => {
                    const filtered = donationCampaign.filter(
                      (d) => d.contractAddress === c.contractAddress,
                    );
                    setActiveDonations(filtered);
                    onDonationModalOpen();
                  }}
                >
                  View Donations
                </Button>

                <Button
                  size="sm"
                  fontSize="xs" // ✅ 字体变小
                  px="10px"     // ✅ 按钮左右间距小一点
                  colorScheme="purple"
                  onClick={async () => {
                    const countRes = await axios.get(
                      `${API_BASE}/spending-count/${c.contractAddress}`,
                    );
                    const spendingList = [];

                    for (let i = 0; i < parseInt(countRes.data.count); i++) {
                      const s = await axios.get(
                        `${API_BASE}/spending/${c.contractAddress}/${i}`,
                      );
                      spendingList.push(s.data);
                    }

                    setActiveSpendings(spendingList);
                    onSpendingModalOpen();
                  }}
                >
                  View Spendings
                </Button>
                <Button
                  size="sm"
                  fontSize="xs" // ✅ 字体变小
                  px="10px"     // ✅ 按钮左右间距小一点
                  colorScheme="green"
                  onClick={() => {
                    setSpendingCampaign(c);
                    setSpendFormModal({
                      description: '',
                      amount: '',
                      receiptFile: null,
                      receiptHash: '',
                      campaignAddress: c.contractAddress, // ✅ set it here
                      title: c.title,
                    });
                    onLogSpendingOpen();
                  }}
                >
                  Log Spending
                </Button>
                {c.status === 'In Progress' && (
                  <Button
                    size="sm"
                    fontSize="xs" // ✅ 字体变小
                    px="10px"     // ✅ 按钮左右间距小一点
                    colorScheme="red"
                    onClick={() => handleStop(c.id)}
                  >
                    Stop Campaign
                  </Button>
                )}
              </Flex>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      <Modal isOpen={isLogSpendingOpen} onClose={onLogSpendingClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Log Spending - {spendingCampaign?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Description"
              name="description"
              value={spendFormModal.description} // Set value from state
              mb={3}
              onChange={handleSpendingFormChange}
            />
            <Input
              placeholder="Amount"
              name="amount"
              type="number"
              value={spendFormModal.amount} // Set value from state
              mb={3}
              onChange={handleSpendingFormChange}
            />
            <Input
              name="receiptHash"
              placeholder="Receipt Hash"
              value={spendFormModal.receiptHash}
              mb={3}
              onChange={handleSpendingFormChange}
            />
            <Input
              type="file"
              accept="image/*"
              mb={3}
              onChange={handleFileChange} // Separate handler for file change
            />
            {spendFormModal.receiptFile && (
              <Text mt={2}>
                Selected file: {spendFormModal.receiptFile.name}
              </Text>
            )}{' '}
            <Input
              name="campaignAddress"
              type="hidden"
              value={spendFormModal.campaignAddress}
            />
            <Input
              name="campaignAddress"
              type="hidden"
              value={spendFormModal.title}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleSpend}>
              Log Spending
            </Button>
            <Button onClick={onLogSpendingClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isDonationModalOpen} onClose={onDonationModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Donations</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {activeDonations.length === 0 ? (
              <Text>No donations found.</Text>
            ) : (
              activeDonations.map((d, i) => (
                <Box key={i} p={3} mb={3} borderWidth="1px" borderRadius="md">
                  <Text>
                    <strong>Amount:</strong> {d.donateAmount}
                  </Text>
                  <Text>
                    <strong>Donor:</strong> {d.donorName}
                  </Text>
                  <Text>
                    <strong>Time:</strong>{' '}
                    {new Date(d.createdAt).toLocaleString()}
                  </Text>
                  <Box
                    as="a"
                    href={`https://sepolia.etherscan.io/tx/${d.tx_hash}`}
                    target="_blank"
                    color="blue.500"
                  >
                    View Tx: {d.tx_hash?.slice(0, 10)}...
                  </Box>
                </Box>
              ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDonationModalClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isSpendingModalOpen} onClose={onSpendingModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Spendings</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {activeSpendings.length === 0 ? (
              <Text>No spendings found.</Text>
            ) : (
              activeSpendings.map((s, i) => (
                <Box key={i} p={3} mb={3} borderWidth="1px" borderRadius="md">
                  <Text>
                    <strong>Description:</strong> {s.description}
                  </Text>
                  <Text>
                    <strong>Amount:</strong> {s.amount}
                  </Text>
                  <Text>
                    <strong>Receipt:</strong> {s.receiptHash}
                  </Text>
                  <Text>
                    <strong>Time:</strong>{' '}
                    {new Date(s.timestamp * 1000).toLocaleString()}
                  </Text>
                </Box>
              ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onSpendingModalClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Campaign</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Title"
              name="title"
              mb={3}
              onChange={handleChange}
            />
            <Input
              placeholder="Description"
              name="description"
              mb={3}
              onChange={handleChange}
            />
            <Select name="category" mb={3} onChange={handleChange}>
              <option value="Medical">Medical</option>
              <option value="Education">Education</option>
              <option value="Disaster Relief">Disaster Relief</option>
              <option value="Waqf Projects">Waqf Projects</option>
              <option value="Zakat Projects">Zakat Projects</option>
              <option value="Sadaqah Projects">Sadaqah Projects</option>
              <option value="Orphans & Widows">Orphans & Widows</option>
              <option value="OKU Support">OKU Support</option>
              <option value="Community Help">Community Help</option>
              <option value="Micro Business">Micro Business</option>
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleCreate}>
              Submit
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Box mt={10}>
        <Heading size="md" mb={4}>
          🎁 Donation Campaigns
        </Heading>
        <Table variant="striped" colorScheme="teal">
          <Thead>
            <Tr>
              <Th>No.</Th>
              <Th>Donor</Th>
              <Th>Amount</Th>
              <Th>Payment ID</Th>
              <Th>Tx Hash</Th>
              <Th>Contract Address</Th>
              <Th>Time</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedDonations.map((item, index) => (
              <Tr key={item.id}>
                <Td>{(currentPage - 1) * itemsPerPage + index + 1}</Td>

                <Td>{item.donorName}</Td>
                <Td>RM {item.donateAmount}</Td>
                <Td>{item.paymentId || '-'}</Td>
                <Td>
                  <Box
                    as="a"
                    href={`https://sepolia.etherscan.io/tx/${item.tx_hash}`}
                    target="_blank"
                    color="blue.500"
                  >
                    {item.tx_hash?.slice(0, 10)}...
                  </Box>
                </Td>
                <Td>{item.contractAddress}</Td>
                <Td>{item.createdAt || '-'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Flex justifyContent="center" mt={4} gap={3}>
          <Button
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            isDisabled={currentPage === 1}
          >
            Previous
          </Button>
          <Text fontSize="sm" mt={2}>
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            isDisabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default Campaign;
