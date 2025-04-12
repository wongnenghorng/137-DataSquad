import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Button,
  Stack,
  Flex,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Input,
  useDisclosure,
} from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/react';

import { generateClient } from 'aws-amplify/api';
import { listCampaigns, listProfiles } from '../../../graphql/queries';
import { createDonationCampaign } from '../../../graphql/mutations';
import { getCurrentUser } from 'aws-amplify/auth';
import axios from 'axios';

const client = generateClient();
const API_BASE =
  'https://testnet111-aqa8fjfhf6a6c7c5.southeastasia-01.azurewebsites.net/contract/';

export default function CampaignDonationPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [organizerName, setOrganizerName] = useState('');
  const [donateTarget, setDonateTarget] = useState(null);
  const [donateForm, setDonateForm] = useState({
    amount: '',
    title: '',
    campaignAddress: '',
  });
  const [campaignStats, setCampaignStats] = useState({});

  const textColor = useColorModeValue('gray.700', 'gray.200');
  const cardBg = useColorModeValue('white', 'gray.700');

  const {
    isOpen: isDonateModalOpen,
    onOpen: onDonateModalOpen,
    onClose: onDonateModalClose,
  } = useDisclosure();

  // Fetch all campaigns
  const fetchCampaigns = async () => {
    try {
      const res = await client.graphql({ query: listCampaigns });
      const items = res.data.listCampaigns.items;
      setCampaigns(items);

      const stats = {};

      await Promise.all(
        items.map(async (campaign) => {
          const address = campaign.contractAddress;
          try {
            const [detailRes, donationCountRes, spendingCountRes] =
              await Promise.all([
                axios.get(`${API_BASE}/detail/${address}`),
                axios.get(`${API_BASE}/donation-count/${address}`),
                axios.get(`${API_BASE}/spending-count/${address}`),
              ]);

            stats[address] = {
              totalDonated: detailRes.data.totalDonated,
              totalSpent: detailRes.data.totalSpent,
              donationCount: donationCountRes.data.count,
              spendingCount: spendingCountRes.data.count,
            };
          } catch (err) {
            console.warn(`Error fetching stats for ${campaign.title}:`, err);
          }
        }),
      );

      setCampaignStats(stats);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get logged-in user profile name
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

  const handleDonateClick = (campaign) => {
    setDonateTarget(campaign);
    setDonateForm({
      campaignAddress: campaign.contractAddress,
      title: campaign.title,
      amount: '',
    });
    onDonateModalOpen();
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/donate`, donateForm);
      alert('Donated! Tx: ' + res.data.txHash);
      await client.graphql({
        query: createDonationCampaign,
        variables: {
          input: {
            title: donateForm.title,
            donorName: organizerName,
            donateAmount: donateForm.amount,
            tx_hash: res.data.txHash,
            contractAddress: donateForm.campaignAddress,
          },
        },
      });
      onDonateModalClose();
    } catch (error) {
      console.error('Donation failed:', error);
      alert('Donation failed. Check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchCampaigns();
  }, []);

  return (
    <Box p={6}>
      <Heading mb={4}>All Campaigns</Heading>
      <Flex justifyContent="flex-end" mb={4}>
        <Text
          fontSize="sm"
          color="blue.500"
          cursor="pointer"
          _hover={{ textDecoration: 'underline' }}
        >
          View My Donation History
        </Text>
      </Flex>
      {loading ? (
        <Spinner size="xl" />
      ) : campaigns.length === 0 ? (
        <Text>No campaigns found.</Text>
      ) : (
        <Stack spacing={4}>
          {campaigns.map((campaign) => (
            <Box
              key={campaign.id}
              p={5}
              shadow="md"
              borderWidth="1px"
              borderRadius="md"
              bg={cardBg}
            >
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontWeight="bold" fontSize="lg" color={textColor}>
                  {campaign.title}
                </Text>
                <Button
                  size="sm"
                  colorScheme="teal"
                  onClick={() => handleDonateClick(campaign)}
                  isDisabled={campaign.status === 'Stopped'}
                >
                  Donate
                </Button>
              </Flex>
              <Text color={textColor}>
                <strong>Description:</strong> {campaign.description}
              </Text>
              <Text color={textColor}>
                <strong>Category:</strong> {campaign.category}
              </Text>

              <Text
                fontWeight="bold"
                fontSize="sm"
                color={campaign.status === 'Stopped' ? 'red.500' : 'green.600'}
              >
                Status: {campaign.status}
              </Text>
              <Text color={textColor}>
                <strong>Organizer:</strong> {campaign.organizerName}
              </Text>
              <Text color={textColor}>
                <strong>Address:</strong> {campaign.contractAddress}
              </Text>

              {/* ✅ Stats */}
              {campaignStats[campaign.contractAddress] && (
                <Box
                  mt={3}
                  bg="gray.50"
                  _dark={{ bg: 'gray.600' }}
                  p={3}
                  borderRadius="md"
                >
                  <Text fontSize="sm" color={textColor}>
                    <strong>Total Donation Amount:</strong> RM{' '}
                    {campaignStats[campaign.contractAddress].totalDonated}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    <strong>Total Spendings Amount:</strong> RM{' '}
                    {campaignStats[campaign.contractAddress].totalSpent}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    <strong>Donation Count:</strong>{' '}
                    {campaignStats[campaign.contractAddress].donationCount}
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    <strong>Spending Count:</strong>{' '}
                    {campaignStats[campaign.contractAddress].spendingCount}
                  </Text>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      )}

      {/* Modal for donation */}
      <Modal isOpen={isDonateModalOpen} onClose={onDonateModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Donate to {donateTarget?.title}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleDonate}>
            <ModalBody>
              <Input
                placeholder="Amount"
                name="amount"
                type="number"
                value={donateForm.amount}
                onChange={(e) =>
                  setDonateForm({ ...donateForm, amount: e.target.value })
                }
                mb={3}
                isRequired
              />
              <Text fontSize="sm" color="gray.500">
                Donating as: <strong>{organizerName || '...'}</strong>
              </Text>
              <Text fontSize="sm" color="gray.500">
                Campaign Address:{' '}
                <strong>{donateTarget?.contractAddress}</strong>
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="teal"
                type="submit"
                isLoading={loading}
                mr={3}
              >
                Confirm Donation
              </Button>
              <Button onClick={onDonateModalClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
}
