import React, { useState } from "react";
import { Doughnut } from "react-chartjs-2";

const resourcesData = [
  { name: "Breathing Exercise", count: 120 },
  { name: "Audio Tunes", count: 90 },
  { name: "Video Tunes", count: 60 },
  { name: "Articles", count: 75 },
  { name: "PHQ-9 Assessment", count: 40 },
  { name: "GAD-7 Assessment", count: 35 },
  { name: "GHQ-12 Assessment", count: 30 },
];

const colors = [
  "#38bdf8", // blue
  "#fbbf24", // yellow
  "#34d399", // green
  "#a78bfa", // purple
  "#f87171", // red
  "#60a5fa", // light blue
  "#f472b6", // pink
];

const RelaxationHubAnalyticsChart = () => {
  const [showLegend, setShowLegend] = useState(true);

  const chartData = {
    labels: resourcesData.map((r) => r.name),
    datasets: [
      {
        data: resourcesData.map((r) => r.count),
        backgroundColor: colors,
        borderColor: "#fff",
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "#1f2937",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.parsed} uses`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 w-full h-[950px] min-h-[600px] flex flex-col justify-start">
      {/* Title */}
      <h2 className="text-xl font-bold text-green-700 mb-6 text-center">
        Relaxation Hub: Most Used Resources
      </h2>

      {/* Chart + Legend */}
      <div className="flex flex-col items-center gap-6">
        <div className="w-52 h-52">
          <Doughnut data={chartData} options={chartOptions} />
        </div>

        {showLegend && (
          <div className="w-full flex flex-col gap-3">
            {resourcesData.map((r, idx) => (
              <div
                key={r.name}
                className="flex items-center gap-3 p-2 rounded-lg bg-white/60 shadow-sm"
              >
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[idx] }}
                ></span>
                <span className="font-medium text-gray-800 text-sm">
                  {r.name}
                </span>
                <span className="ml-auto bg-gray-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {r.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <div className="mt-5 flex justify-center">
        <button
          className="px-4 py-1.5 rounded-full bg-green-700 text-white text-xs font-semibold hover:bg-green-800 transition"
          onClick={() => setShowLegend((prev) => !prev)}
        >
          {showLegend ? "Hide Legend" : "Show Legend"}
        </button>
      </div>
    </div>
  );
};

export default RelaxationHubAnalyticsChart;
