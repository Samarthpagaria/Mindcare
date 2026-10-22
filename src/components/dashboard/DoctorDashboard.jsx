// src/components/dashboard/DoctorDashboard.jsx
const DoctorDashboard = ({ userData }) => (
  <div className="text-center">
    <h2 className="text-3xl font-bold">Welcome, Dr. {userData.lastName}!</h2>
    <p className="text-gray-400">This is your doctor dashboard.</p>
  </div>
);

export default DoctorDashboard;