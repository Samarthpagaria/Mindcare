import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Example avatars (replace with real images/URLs if needed)
const counselorAvatars = {
  "Dr. Sharma": "https://randomuser.me/api/portraits/men/32.jpg",
  "Dr. Patel": "https://randomuser.me/api/portraits/men/33.jpg",
  "Dr. Singh": "https://randomuser.me/api/portraits/men/34.jpg",
  "Dr. Mehta": "https://randomuser.me/api/portraits/men/35.jpg",
  "Dr. Rao": "https://randomuser.me/api/portraits/men/36.jpg",
  "Dr. Das": "https://randomuser.me/api/portraits/men/37.jpg",
};

const counselorsData = [
  { name: "Dr. Sharma", count: 18 },
  { name: "Dr. Patel", count: 25 },
  { name: "Dr. Singh", count: 12 },
  { name: "Dr. Mehta", count: 20 },
  { name: "Dr. Rao", count: 15 },
  { name: "Dr. Das", count: 10 },
];

const AppointmentsBookedChart = () => {
  const [showAll, setShowAll] = useState(false);
  const displayData = showAll ? counselorsData : counselorsData.slice(0, 5);

  const chartData = {
    labels: displayData.map((c) => c.name),
    datasets: [
      {
        label: "Appointments Booked",
        data: displayData.map((c) => c.count),
        backgroundColor: "rgba(37, 99, 235, 0.7)",
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    indexAxis: "y",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#2563eb",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function (context) {
            const name = context.label;
            const count = context.raw;
            return `${name}: ${count} appointments`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: "#222", font: { weight: "bold" } },
        grid: { color: "rgba(200,200,200,0.2)" },
      },
      y: {
        ticks: { color: "#222", font: { weight: "bold" } },
        grid: { color: "rgba(200,200,200,0.2)" },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 w-full h-[500px] min-h-[400px] flex flex-col justify-between items-center">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
        Appointments Booked with Counselors
      </h2>
      <div className="flex flex-col md:flex-row gap-8 w-full mb-6 items-center justify-center">
        <div className="flex-1 flex flex-col gap-4">
          {displayData.map((c) => (
            <div key={c.name} className="flex items-center gap-3">
              <img
                src={counselorAvatars[c.name]}
                alt={c.name}
                className="w-8 h-8 rounded-full border border-blue-200"
              />
              <span className="font-semibold text-gray-800">{c.name}</span>
              <span className="ml-auto bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                {c.count} appointments
              </span>
            </div>
          ))}
        </div>
        <div className="flex-1 flex justify-center">
          <div className="h-64 w-full flex items-center justify-center">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
      <div className="mt-4 w-full flex justify-end">
        <button
          className="px-4 py-1 rounded-full bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition-colors"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? "Show Top 5" : "Show All"}
        </button>
      </div>
    </div>
  );
};

export default AppointmentsBookedChart;
