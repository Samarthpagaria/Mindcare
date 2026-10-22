// ...existing code...
import CollegeAdminSidebar from "./CollegeAdminSidebar";
import MostSearchedQueriesCard from "./MostSearchedQueriesCard";
import MoodPieChart from "./MoodPieChart";
import ActiveUsersGraph from "./ActiveUsersGraph";
import AppointmentsBookedChart from "./AppointmentsBookedChart";
import RelaxationHubAnalyticsChart from "./RelaxationHubAnalyticsChart";
import CommunitiesAnalyticsCard from "./CommunitiesAnalyticsCard";

import React, { useState } from "react";

const CollegeAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="flex min-h-screen">
      <CollegeAdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      {/* Main content area for college admin can go here */}
      <div
        className={`flex-1 p-8 transition-all duration-300 ${
          sidebarOpen ? "md:ml-64" : "md:ml-0"
        }`}
      >
        <h1 className="text-3xl font-bold mb-6">
          Welcome to College Admin Dashboard
        </h1>
        {/* ...existing code... */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 bento-grid">
          {/* First row: Most Searched Queries and Student Mood Analytics */}
          <div className="col-span-1">
            <MostSearchedQueriesCard />
          </div>
          <div className="col-span-1">
            <MoodPieChart />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 bento-grid mt-8">
          {/* Second row: Active Users & Counsellors and Relaxation Hub side by side */}
          <div className="col-span-1">
            <ActiveUsersGraph />
          </div>
          <div className="col-span-1">
            <RelaxationHubAnalyticsChart />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 bento-grid mt-8">
          {/* Third row: Community Analytics full width */}
          <div className="col-span-1">
            <CommunitiesAnalyticsCard />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 bento-grid mt-8">
          {/* Fourth row: Appointments Booked Chart full width */}
          <div className="col-span-1">
            <AppointmentsBookedChart />
          </div>
        </div>
        {/* Add more content/components here as needed */}
      </div>
    </div>
  );
};

export default CollegeAdmin;
