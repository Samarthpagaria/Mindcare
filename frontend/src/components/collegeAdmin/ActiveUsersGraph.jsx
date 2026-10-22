import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart.js modules
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const timeRanges = [
  {
    label: "Past 1 Week",
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    users: [120, 180, 150, 220, 170, 260, 310],
    counsellors: [18, 22, 20, 25, 21, 28, 35],
  },
  {
    label: "Past 2 Weeks",
    labels: ["Week 1", "Week 2"],
    users: [1050, 1420],
    counsellors: [140, 185],
  },
  {
    label: "Past 1 Month",
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    users: [900, 1150, 1600, 1750],
    counsellors: [120, 135, 160, 180],
  },
  {
    label: "Past 3 Months",
    labels: ["Month 1", "Month 2", "Month 3"],
    users: [3200, 4100, 3900],
    counsellors: [300, 360, 340],
  },
  {
    label: "Past 6 Months",
    labels: ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"],
    users: [2800, 3500, 4200, 3900, 4600, 5100],
    counsellors: [250, 310, 370, 340, 400, 450],
  },
];

const ActiveUsersGraph = () => {
  const [selectedRange, setSelectedRange] = useState(0);
  const range = timeRanges[selectedRange];

  const chartData = {
    labels: range.labels,
    datasets: [
      {
        label: "Active Users",
        data: range.users,
        fill: true,
        borderColor: "#222",
        backgroundColor: "rgba(34, 34, 34, 0.1)",
        pointBackgroundColor: "#222",
        pointBorderColor: "#222",
        tension: 0.4,
      },
      {
        label: "Counsellors",
        data: range.counsellors,
        fill: true,
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.1)",
        pointBackgroundColor: "#007bff",
        pointBorderColor: "#007bff",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        labels: {
          color: "#222",
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#222",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      x: {
        ticks: { color: "#222" },
        grid: { color: "rgba(200,200,200,0.15)" },
      },
      y: {
        ticks: { color: "#222" },
        grid: { color: "rgba(200,200,200,0.15)" },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 w-full h-[520px] min-h-[320px] flex flex-col justify-start">
      <h2 className="text-2xl font-bold text-black mb-6">
        Active Users & Counsellors Analytics
      </h2>
      <div className="mb-4 flex gap-2 flex-wrap">
        {timeRanges.map((range, idx) => (
          <button
            key={range.label}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              selectedRange === idx
                ? "bg-black text-white shadow-md"
                : "bg-white/50 text-black hover:bg-black hover:text-white shadow-sm"
            }`}
            onClick={() => setSelectedRange(idx)}
          >
            {range.label}
          </button>
        ))}
      </div>
      <div className="h-72">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default ActiveUsersGraph;
