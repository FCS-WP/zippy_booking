import React, { useMemo, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Stack, Box } from "@mui/material";
Chart.register(...registerables);
const BookingMainChart = () => {
  const options = useMemo(
    () => ({
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              return `Sales: $${tooltipItem.raw.toFixed(2)}`;
            },
          },
        },
      },
    }),
    []
  );
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const [chartData, setChartData] = useState({
    labels: MONTHS,
    datasets: [
      {
        label: "Monthly Revenue",
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderWidth: 2,
        backgroundColor: "rgba(34, 113, 177, 1)",
        borderColor: "rgba(34, 113, 177, 1)",
        tension: 0.1,
        aspectRatio: 16 / 9,
      },
    ],
  });
  const chartRef = useRef(null);
  return (
    <Stack my={4}>
      <Box>
        <h2>Technical Analysis</h2>
      </Box>
      <Box bg={"#fff"}>
        <Bar
          height={430}
          ref={chartRef}
          width={780}
          data={chartData}
          options={options}
        ></Bar>
      </Box>
    </Stack>
  );
};

export default BookingMainChart;
