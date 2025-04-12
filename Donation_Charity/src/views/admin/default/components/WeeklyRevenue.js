import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Card from "components/card/Card.js";
import BarChart from "components/charts/BarChart";
import { MdBarChart } from "react-icons/md";

import { generateClient } from "aws-amplify/api";
import { listDonationCampaigns, listCampaignSpendings } from "graphql/queries";

export default function WeeklyRevenue(props) {
  const { ...rest } = props;

  const textColor = useColorModeValue("secondaryGray.900", "white");
  const iconColor = useColorModeValue("brand.500", "white");
  const bgButton = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const bgHover = useColorModeValue(
    { bg: "secondaryGray.400" },
    { bg: "whiteAlpha.50" }
  );
  const bgFocus = useColorModeValue(
    { bg: "secondaryGray.300" },
    { bg: "whiteAlpha.100" }
  );

  const [chartData, setChartData] = useState([]);
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const client = generateClient();

      try {
        // Fetch donations
        const donationRes = await client.graphql({
          query: listDonationCampaigns,
        });
        const donations = donationRes.data.listDonationCampaigns.items || [];

        // Fetch spendings
        const spendingRes = await client.graphql({
          query: listCampaignSpendings,
        });
        const spendings = spendingRes.data.listCampaignSpendings.items || [];

        // Merge by title/campaignName
        const mergedMap = {};

        donations.forEach((d) => {
          const name = d.title?.trim();
          if (!mergedMap[name]) mergedMap[name] = {};
          mergedMap[name].donateAmount =
            (mergedMap[name].donateAmount || 0) + parseFloat(d.donateAmount || 0);
        });

        spendings.forEach((s) => {
          const name = s.campaignName?.trim();
          if (!mergedMap[name]) mergedMap[name] = {};
          mergedMap[name].spendAmount =
            (mergedMap[name].spendAmount || 0) + parseFloat(s.spendAmount || 0);
        });

        // Final merged data
        const mergedData = Object.entries(mergedMap)
          .filter(([key, value]) => value.donateAmount || value.spendAmount)
          .map(([name, values]) => ({
            name,
            donateAmount: values.donateAmount || 0,
            spendAmount: values.spendAmount || 0,
          }));

        // Chart data format
        const barChartData = [
          {
            name: "Donation",
            data: mergedData.map((item) => item.donateAmount),
          },
          {
            name: "Spending",
            data: mergedData.map((item) => item.spendAmount),
          },
        ];

        const barChartOptions = {
          chart: {
            stacked: true,
            toolbar: { show: false },
          },
          tooltip: {
            theme: "dark",
            y: {
              formatter: (val) => `RM ${val}`,
            },
          },
          xaxis: {
            categories: mergedData.map((item) => item.name),
            labels: {
              style: {
                colors: "#A3AED0",
                fontSize: "14px",
                fontWeight: "500",
              },
            },
          },
          plotOptions: {
            bar: {
              borderRadius: 0,
              columnWidth: "20px",
            },
          },
          fill: {
            type: "solid",
            colors: ["#5E37FF", "#6AD2FF"], // Purple + Blue
          },
          colors: ["#5E37FF", "#6AD2FF"],
          dataLabels: { enabled: false },
          legend: { show: true },
          grid: {
            show: false,
          },
        };

        setChartData(barChartData);
        setChartOptions(barChartOptions);
      } catch (err) {
        console.error("Error fetching chart data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <Card align="center" direction="column" w="100%" {...rest}>
      <Flex align="center" w="100%" px="15px" py="10px">
        <Text
          me="auto"
          color={textColor}
          fontSize="xl"
          fontWeight="700"
          lineHeight="100%"
        >
          Campaign Donation And Spending List
        </Text>
        <Button
          align="center"
          justifyContent="center"
          bg={bgButton}
          _hover={bgHover}
          _focus={bgFocus}
          _active={bgFocus}
          w="37px"
          h="37px"
          lineHeight="100%"
          borderRadius="10px"
          {...rest}
        >
          <Icon as={MdBarChart} color={iconColor} w="24px" h="24px" />
        </Button>
      </Flex>

      <Box h="240px" mt="auto">
        {chartData.length > 0 && (
          <BarChart chartData={chartData} chartOptions={chartOptions} />
        )}
      </Box>
    </Card>
  );
}
