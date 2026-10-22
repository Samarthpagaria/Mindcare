// src/components/dashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../../firebase';

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5001/api/auth';

  const fetchUnverifiedDoctors = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get(`${API_URL}/admin/unverified-doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data);
    } catch (err) {
      setError('Failed to fetch doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnverifiedDoctors();
  }, []);

  const handleVerify = async (doctorId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(`${API_URL}/admin/verify-doctor`, { doctorId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUnverifiedDoctors();
    } catch (err) {
      alert('Verification failed.');
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="w-full max-w-4xl p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white">Admin Dashboard: Doctor Verification</h2>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Specialization</th>
              <th className="px-6 py-3">License No.</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {doctors.length > 0 ? doctors.map(doc => (
              <tr key={doc.id} className="bg-gray-800 border-b border-gray-700">
                <td className="px-6 py-4">{doc.firstName} {doc.lastName}</td>
                <td className="px-6 py-4">{doc.email}</td>
                <td className="px-6 py-4">{doc.specialization}</td>
                <td className="px-6 py-4">{doc.licenseNumber}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleVerify(doc.id)} className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700">
                    Verify
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">No pending doctor verifications.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;