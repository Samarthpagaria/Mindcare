import React from "react";

const queryData = [
  { word: "depression", count: 120 },
  { word: "anxiety", count: 95 },
  { word: "stress", count: 80 },
  { word: "relationship", count: 60 },
  { word: "exam", count: 45 },
  { word: "sleep", count: 30 },
  { word: "career", count: 25 },
  { word: "loneliness", count: 20 },
];

const MostSearchedQueriesCard = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 w-full h-[320px] min-h-[220px] flex flex-col justify-start">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Most Searched Queries
      </h2>
      <div className="flex flex-wrap gap-4">
        {queryData.map((item) => (
          <div
            key={item.word}
            className="flex items-center bg-gray-50 rounded-xl px-4 py-2 shadow-sm"
          >
            <span className="bg-blue-100 text-blue-900 text-xs font-semibold px-2 py-1 rounded-full mr-3 border border-blue-200">
              {item.word}
            </span>
            <span className="text-gray-700 font-medium">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MostSearchedQueriesCard;
