import React, { useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

const moodLabels = [
  "Happy",
  "Sad",
  "Stressed",
  "Motivated",
  "Anxious",
  "Relaxed",
];
const moodColors = [
  "#38bdf8", // Happy - blue
  "#f87171", // Sad - red
  "#fbbf24", // Stressed - yellow
  "#34d399", // Motivated - green
  "#a78bfa", // Anxious - purple
  "#60a5fa", // Relaxed - light blue
];

const timeRanges = [
  { label: "Last 1 Week", data: [40, 20, 15, 10, 10, 5] },
  { label: "Last 2 Weeks", data: [70, 30, 45, 23, 45, 10] },
  { label: "Last 1 Month", data: [12, 60, 40, 30, 25, 15] },
];

const MoodPieChart = () => {
  const [selectedRange, setSelectedRange] = useState(0);

  const chartData = {
    labels: moodLabels,
    datasets: [
      {
        label: "Mood Distribution",
        data: timeRanges[selectedRange].data,
        backgroundColor: moodColors,
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  return (
    <div className="bg-blue-50 border border-gray-200 rounded-2xl shadow-lg p-8 w-full h-full flex flex-col justify-between">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Student Mood Analytics
      </h2>
      <div className="mb-4 flex gap-2">
        {timeRanges.map((range, idx) => (
          <button
            key={range.label}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white/80 ${
              selectedRange === idx
                ? "bg-blue-700 text-white"
                : "bg-blue-100 text-blue-900 hover:bg-blue-700 hover:text-white"
            }`}
            onClick={() => setSelectedRange(idx)}
          >
            {range.label}
          </button>
        ))}
      </div>
      <Pie data={chartData} />
    </div>
  );
};

export default MoodPieChart;
