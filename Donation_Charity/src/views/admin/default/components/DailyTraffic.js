import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Icon,
  Text,
  useColorModeValue,
  Spinner,
} from "@chakra-ui/react";
import { RiArrowUpSFill } from "react-icons/ri";
import { generateClient } from "aws-amplify/api";
import { listDonations, listDonationCampaigns } from "graphql/queries";
import Chart from "react-apexcharts";
import Card from "components/card/Card";

export default function DonationRankingChart() {
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const client = generateClient();

        const [personalRes, campaignRes] = await Promise.all([
          client.graphql({ query: listDonations }),
          client.graphql({ query: listDonationCampaigns }),
        ]);

        const personalDonations = personalRes.data.listDonations.items || [];
        const campaignDonations =
          campaignRes.data.listDonationCampaigns.items || [];

        const donationMap = {};

        personalDonations.forEach((item) => {
          const name = item.DonorName || "Unknown";
          const amount = parseFloat(item.DonateAmount || 0);
          donationMap[name] = (donationMap[name] || 0) + amount;
        });

        campaignDonations.forEach((item) => {
          const name = item.donorName || "Unknown";
          const amount = parseFloat(item.donateAmount || 0);
          donationMap[name] = (donationMap[name] || 0) + amount;
        });

        const sorted = Object.entries(donationMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 7);

        setRankingData(sorted);
      } catch (err) {
        console.error("Error fetching donation ranking:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    xaxis: {
      categories: rankingData.map(([name]) => name),
      labels: {
        style: { colors: "#A3AED0", fontSize: "12px" },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#A3AED0", fontSize: "12px" },
      },
    },
    tooltip: {
      y: {
        formatter: (val) => `RM ${val.toFixed(2)}`,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: "45%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false, // ❌ 隐藏图例
    },
    colors: ["#4318FF"],
  };

  const chartData = [
    {
      name: "Total Donation",
      data: rankingData.map(([_, amount]) => amount),
    },
  ];

  return (
    <Card align="center" direction="column" w="100%">
      <Flex justify="space-between" align="start" px="10px" pt="5px" w="100%">
        <Text color="secondaryGray.600" fontSize="sm" fontWeight="500">
          Donation Ranking
        </Text>
        <Flex align="center">
          <Icon as={RiArrowUpSFill} color="green.500" />
          <Text color="green.500" fontSize="sm" fontWeight="700">
            Top 7
          </Text>
        </Flex>
      </Flex>

      <Box h="240px" mt="auto" w="100%">
        {loading ? (
          <Flex justify="center" align="center" h="100%">
            <Spinner size="lg" />
          </Flex>
        ) : (
          <Chart
            options={chartOptions}
            series={chartData}
            type="bar"
            height={240}
          />
        )}
      </Box>
    </Card>
  );
}
