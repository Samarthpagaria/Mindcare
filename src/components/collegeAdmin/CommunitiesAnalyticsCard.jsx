import React from "react";
import { Users, UserCircle, Layers } from "lucide-react"; // icons

// Example data: Replace with real data from backend/API
const communitiesData = [
  { name: "Mental Health Warriors", counselor: "Dr. Sharma", members: 120 },
  { name: "Stress Busters", counselor: "Dr. Patel", members: 90 },
  { name: "Anxiety Support", counselor: "Dr. Singh", members: 60 },
  { name: "Wellness Circle", counselor: "Dr. Mehta", members: 75 },
  { name: "Growth Mindset", counselor: "Dr. Rao", members: 40 },
];

const counselorCommunityCount = {};
communitiesData.forEach((c) => {
  counselorCommunityCount[c.counselor] =
    (counselorCommunityCount[c.counselor] || 0) + 1;
});

const totalCommunities = communitiesData.length;
const totalCounselors = Object.keys(counselorCommunityCount).length;
const totalMembers = communitiesData.reduce((sum, c) => sum + c.members, 0);
const avgMembers = Math.round(totalMembers / totalCommunities);

const CommunitiesAnalyticsCard = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-10 w-full h-[950px] min-h-[600px] flex flex-col justify-between">
      {/* Title */}
      <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
        Community Analytics
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="flex flex-col items-center bg-purple-50 rounded-xl p-4 shadow-sm h-full">
          <Layers className="text-purple-600 w-8 h-8 mb-2" />
          <span className="text-3xl font-extrabold text-purple-700">
            {totalCommunities}
          </span>
          <span className="text-sm text-gray-600">Total Communities</span>
        </div>
        <div className="flex flex-col items-center bg-purple-50 rounded-xl p-4 shadow-sm h-full">
          <UserCircle className="text-purple-600 w-8 h-8 mb-2" />
          <span className="text-3xl font-extrabold text-purple-700">
            {totalCounselors}
          </span>
          <span className="text-sm text-gray-600">Counselors</span>
        </div>
        <div className="flex flex-col items-center bg-purple-50 rounded-xl p-4 shadow-sm h-full">
          <Users className="text-purple-600 w-8 h-8 mb-2" />
          <span className="text-3xl font-extrabold text-purple-700">
            {avgMembers}
          </span>
          <span className="text-sm text-gray-600">Avg. Members/Community</span>
        </div>
      </div>

      {/* Counselor Community Count */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Counselor Community Count
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(counselorCommunityCount).map(([counselor, count]) => (
            <div
              key={counselor}
              className="flex justify-between items-center bg-white/70 rounded-lg px-4 py-2 shadow-sm"
            >
              <span className="font-medium text-purple-700">{counselor}</span>
              <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full text-xs font-bold">
                {count} communities
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Community List */}
      <div className="mt-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Community List
        </h3>
        <ul className="space-y-2">
          {communitiesData.map((community) => (
            <li
              key={community.name}
              className="flex items-center gap-3 bg-white/70 px-4 py-2 rounded-lg shadow-sm"
            >
              <span className="font-medium text-gray-700">
                {community.name}
              </span>
              <span className="text-xs text-gray-500">
                by {community.counselor}
              </span>
              <span className="ml-auto bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                {community.members} members
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CommunitiesAnalyticsCard;
