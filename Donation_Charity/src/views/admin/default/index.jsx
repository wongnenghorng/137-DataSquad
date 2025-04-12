import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Icon,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";

import {
  listAppointments,
  listCampaigns,
  listDonations,
  listDonationCampaigns,
} from "graphql/queries";
import { generateClient } from "aws-amplify/api";

import {
  columnsDataComplex,
} from "views/admin/default/variables/columnsData";
import tableDataComplex from "views/admin/default/variables/tableDataComplex.json";

import IconBox from "components/icons/IconBox";
import MiniStatistics from "components/card/MiniStatistics";
import ComplexTable from "views/admin/default/components/ComplexTable";
import DailyTraffic from "views/admin/default/components/DailyTraffic";
import PieCard from "views/admin/default/components/PieCard";
import TotalSpent from "views/admin/default/components/TotalSpent";
import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";

import {
  MdAddTask,
  MdAttachMoney,
  MdBarChart,
  MdFileCopy,
} from "react-icons/md";

import CheckTable from "../dataTables/components/CheckTable";
import CampaignSpendingTable from "../rtl/components/CampaignSpendingTable";
import DonationBarChart from "./components/DailyTraffic";
import DonationRankingChart from "./components/DailyTraffic";

export default function UserReports() {
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");

  const [appointmentCount, setAppointmentCount] = useState(0);
  const [campaignCount, setCampaignCount] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [todayDonationCount, setTodayDonationCount] = useState(0);
  const [todayDonationAmount, setTodayDonationAmount] = useState(0); // ✅ 新增

  useEffect(() => {
    const client = generateClient();

    const fetchStats = async () => {
      try {
        const aRes = await client.graphql({ query: listAppointments });
        const appointments = aRes.data.listAppointments.items || [];
        setAppointmentCount(appointments.length);

        const cRes = await client.graphql({ query: listCampaigns });
        const campaigns = cRes.data.listCampaigns.items || [];
        setCampaignCount(campaigns.length);

        const dRes = await client.graphql({ query: listDonations });
        const donations = dRes.data.listDonations.items || [];

        const campaignRes = await client.graphql({ query: listDonationCampaigns });
        const campaignDonations = campaignRes.data.listDonationCampaigns.items || [];

        const totalPersonal = donations.reduce((sum, d) => {
          const amount = parseFloat(d.DonateAmount || 0);
          return sum + amount;
        }, 0);

        const totalCampaign = campaignDonations.reduce((sum, c) => {
          const amount = parseFloat(c.donateAmount || 0);
          return sum + amount;
        }, 0);

        const totalCombined = totalPersonal + totalCampaign;
        setTotalReceived(totalCombined.toFixed(2));

        // ✅ 今天的日期
        const todayStr = new Date().toISOString().split("T")[0];

        // ✅ 今天的捐款数量
        const todayCountPersonal = donations.filter((d) =>
          d.createdAt?.startsWith(todayStr)
        ).length;

        const todayCountCampaign = campaignDonations.filter((c) =>
          c.createdAt?.startsWith(todayStr)
        ).length;

        setTodayDonationCount(todayCountPersonal + todayCountCampaign);

        // ✅ 今天的捐款金额
        const todayDonations = donations.filter((d) =>
          d.createdAt?.startsWith(todayStr)
        );

        const todayCampaignDonations = campaignDonations.filter((c) =>
          c.createdAt?.startsWith(todayStr)
        );

        const todayPersonalTotal = todayDonations.reduce((sum, d) => {
          const amount = parseFloat(d.DonateAmount || 0);
          return sum + amount;
        }, 0);

        const todayCampaignTotal = todayCampaignDonations.reduce((sum, c) => {
          const amount = parseFloat(c.donateAmount || 0);
          return sum + amount;
        }, 0);

        setTodayDonationAmount((todayPersonalTotal + todayCampaignTotal).toFixed(2));
      } catch (err) {
        console.error("❌ Error fetching stats:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, "2xl": 6 }} gap="20px" mb="20px">
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={<Icon w="32px" h="32px" as={MdBarChart} color={brandColor} />}
            />
          }
          name="Total Number of Request Personal Donation"
          value={appointmentCount}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={<Icon w="32px" h="32px" as={MdAttachMoney} color={brandColor} />}
            />
          }
          name="Total Number of Campaign"
          value={campaignCount}
        />
        <MiniStatistics
          name="Total Received Donation"
          value={`RM ${totalReceived}`}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg="linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)"
              icon={<Icon w="28px" h="28px" as={MdAddTask} color="white" />}
            />
          }
          name="Number of Donations Today"
          value={todayDonationCount}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w="56px"
              h="56px"
              bg={boxBg}
              icon={<Icon w="32px" h="32px" as={MdAttachMoney} color={brandColor} />}
            />
          }
          name="Donation Amount Today："
          value={
            <Box>
              <Box fontSize="sm" fontWeight="medium" color="gray.500">
                RM
              </Box>
              <Box fontSize="xl" fontWeight="bold">
                {todayDonationAmount}
              </Box>
            </Box>
          }
        />
      </SimpleGrid>

      <SimpleGrid columns={1} gap="20px" mb="20px">
        <WeeklyRevenue />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap="20px" mb="20px">
        <ComplexTable
          columnsData={columnsDataComplex}
          tableData={tableDataComplex}
        />
        <SimpleGrid columns={1} gap="20px">
          <DonationRankingChart />
        </SimpleGrid>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 1, xl: 2 }} gap="20px" mb="20px">
        <CheckTable />
        <CampaignSpendingTable />
      </SimpleGrid>

      <Box mt="20px" w="100%" maxW="760px" overflowX="auto"></Box>
    </Box>
  );
}
