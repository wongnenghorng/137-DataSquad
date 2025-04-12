import { getCurrentUser } from 'aws-amplify/auth';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Text,
  Spinner,
  VStack,
  Heading,
  Button,
  Flex,
  Container,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { generateClient } from 'aws-amplify/api';
import { listAppointments, listProfiles, listDonations } from '../../../../graphql/queries';

export default function DonationRecommendationList() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [donateAmount, setDonateAmount] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [donorName, setDonorName] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const {
    isOpen: isHistoryOpen,
    onOpen: openHistory,
    onClose: closeHistory
  } = useDisclosure();

  const [myDonations, setMyDonations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchAppointments = async () => {
    try {
      const client = generateClient();
  
      // Fetch appointments
      const result = await client.graphql({ query: listAppointments });
      const allAppointments = result.data.listAppointments.items;
  
      const acceptedAppointments = allAppointments.filter(
        app => app.status === 'accept' || app.status === 'Accepted'
      );
  
      // Fetch donations
      const donationsRes = await client.graphql({ query: listDonations });
      const donations = donationsRes.data.listDonations.items;

      const donationsTotal = donations.reduce((acc, donation) => {
        const receiver = donation.ReceiverName;
        const amount = parseFloat(donation.DonateAmount || 0);
      
        if (!acc[receiver]) {
          acc[receiver] = 0;
        }
        acc[receiver] += amount;
      
        return acc;
      }, {});
      
      console.log(donationsTotal)
  
      const formattedForAPI = acceptedAppointments.map(app => ({
        name: app.name,
        family_size: parseInt(app.householdSize),
        total_income: parseFloat(app.householdIncome),
        requested_amount: parseFloat(app.amountNeeded),
        total_received_amount: donationsTotal[app.name] || 0, 
        is_OKU: app.isOku ? 1 : 0
      }));
  
      const response = await axios.post(
        'https://umhackthon-cegvanbrfbfxc4c2.southeastasia-01.azurewebsites.net/predict',
        formattedForAPI,
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      const enriched = response.data.map(pred => {
        const original = acceptedAppointments.find(app => app.name === pred.name);
  
        // ✨ 自动从 donation 里找 receiverName 一样的记录总额
        const donatedTotal = donations
          .filter(d => d.ReceiverName === original.name)
          .reduce((sum, d) => sum + parseFloat(d.DonateAmount || 0), 0);
  
        return {
          ...original,
          predicted_class: pred.predicted_class,
          purpose: original.purpose,
          donatedTotal: donatedTotal  // 💰加入字段
        };
      });
  
      const sorted = enriched.sort((a, b) => b.predicted_class - a.predicted_class);
      setRecommendations(sorted);
    } catch (err) {
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  };
  

  const fetchUserEmailAndDonorName = async () => {
    try {
      const user = await getCurrentUser();
      const email = user?.signInDetails?.loginId || '';
      setCurrentUserEmail(email);

      const client = generateClient();
      const res = await client.graphql({ query: listProfiles });
      const profiles = res.data.listProfiles.items;
      const matchedProfile = profiles.find(p => p.email === email);
      if (matchedProfile) {
        setDonorName(matchedProfile.name);
      }
    } catch (err) {
      console.error("❌ Error fetching user or donor name:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchUserEmailAndDonorName();
  }, []);

  useEffect(() => {
    if (isHistoryOpen && currentUserEmail) {
      fetchDonationHistory();
    }
  }, [isHistoryOpen, currentUserEmail]);

  const fetchDonationHistory = async () => {
    try {
      setLoadingHistory(true);
      const client = generateClient();
      const res = await client.graphql({
        query: listDonations,
        variables: {
          filter: {
            email: { eq: currentUserEmail }
          }
        }
      });
      const items = res.data.listDonations.items || [];
      const clean = items.filter(d => d.createdAt);
      setMyDonations(clean);
    } catch (err) {
      console.error("❌ Error fetching history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDonateClick = (recipient) => {
    setSelectedRecipient(recipient);
    setDonateAmount('');
    onOpen();
  };

  const handleConfirmDonation = async () => {
    if (!donateAmount || isNaN(donateAmount)) {
      toast({ title: "请输入有效金额", status: "warning" });
      return;
    }

    const payload = {
      name: selectedRecipient.name,
      amount: donateAmount,
      email: currentUserEmail,
      donorName: donorName
    };

    console.log("📦 Donation Payload:", payload);

    try {
      const res = await axios.post(
        'https://request-h6dhhtaxc8eac3bm.southeastasia-01.azurewebsites.net/api/create-payment',
        payload
      );

      if (res.data.payment_url) {
        window.open(res.data.payment_url, '_blank');
      } else {
        toast({ title: "未能取得付款链接", status: "error" });
      }
    } catch (err) {
      console.error('❌ Payment error:', err);
      toast({ title: "Payment failed. Before making a payment, please go to the top right corner, register an account, then log in. After that, fill in your profile.", status: "error" });
    } finally {
      onClose();
    }
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardShadow = useColorModeValue('md', 'dark-lg');

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Fetching recommendations...</Text>
      </Box>
    );
  }

  return (
    <Container maxW="6xl" py={10}>
      <Heading size="lg" mb={6}>Donation Recommendations</Heading>

      <Flex justifyContent="flex-end" mb={4}>
        <Text
          fontSize="sm"
          color="blue.500"
          cursor="pointer"
          _hover={{ textDecoration: "underline" }}
          onClick={openHistory}
        >
          View My Donation History
        </Text>
      </Flex>

      {recommendations.length === 0 ? (
        <Text>No recommendations received from AI API.</Text>
      ) : (
        <VStack spacing={6} align="stretch">
          {recommendations.map((rec, index) => {
            const totalNeeded = parseFloat(rec.amountNeeded) - (parseFloat(rec.totalReceipt) || 0);

            let priorityLabel = '';
            let color = '';

            if (rec.predicted_class === 1) {
              priorityLabel = 'High Priority';
              color = 'green.400';
            } else if (rec.predicted_class === 0) {
              priorityLabel = 'Medium Priority';
              color = 'yellow.400';
            } else {
              priorityLabel = 'Low Priority';
              color = 'red.400';
            }

            return (
              <Box
                key={index}
                p={6}
                borderRadius="lg"
                borderLeft="6px solid"
                borderColor={color}
                bg={cardBg}
                boxShadow={cardShadow}
              >
                <Text fontWeight="bold" fontSize="xl" mb={2}>{rec.name}</Text>
                <Text><strong>Priority:</strong> <span style={{ color }}>{priorityLabel}</span></Text>
                <Text><strong>Income:</strong> RM {rec.householdIncome}</Text>
                <Text><strong>Family Size:</strong> {rec.householdSize}</Text>
                <Text><strong>IsOKU:</strong> {rec.isOku ? 'Yes' : 'No'}</Text>
                <Text><strong>Purpose:</strong> {rec.purpose || 'N/A'}</Text>
                <Text><strong>Total Needed:</strong> RM {(rec.amountNeeded - rec.donatedTotal).toFixed(2)}</Text>


                <Flex justifyContent="flex-end" mt={4}>
                  <Button colorScheme="blue" px={8} borderRadius="lg" onClick={() => handleDonateClick(rec)}>
                    Donate
                  </Button>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      )}

      {/* Modal 输入金额 */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter Donation Amount</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter amount in MYR"
              value={donateAmount}
              onChange={(e) => setDonateAmount(e.target.value)}
              type="number"
              min={1}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleConfirmDonation}>
              Confirm & Pay
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal 查看历史捐款 */}
      <Modal isOpen={isHistoryOpen} onClose={closeHistory} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>My Donation History</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loadingHistory ? (
              <Spinner />
            ) : myDonations.length === 0 ? (
              <Text>No donations found.</Text>
            ) : (
              <Box overflowX="auto">
                <TableContainer>
                  <Table variant="simple">
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
                      {myDonations.map((donation, index) => (
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
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeHistory}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
