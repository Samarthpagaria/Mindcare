// src/components/dashboard/UserDashboard.jsx
const UserDashboard = ({ userData }) => (
  <div className="text-center">
    <h2 className="text-3xl font-bold">Welcome, {userData.firstName}!</h2>
    <p className="text-gray-400">This is your user dashboard.</p>
  </div>
);

export default UserDashboard;