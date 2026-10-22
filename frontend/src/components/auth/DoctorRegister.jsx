// src/components/auth/DoctorRegister.jsx
import React, { useState } from 'react';
import axios from 'axios';
import Spinner from '../common/Spinner';

const DoctorRegisterPage = ({ setPage }) => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', specialization: '', licenseNumber: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:5001/api/auth';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/register-doctor`, formData);
      setMessage(response.data.message);
      setTimeout(() => setPage('login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-lg p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-white">Doctor Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input name="firstName" placeholder="First Name" onChange={handleChange} required className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" />
          <input name="lastName" placeholder="Last Name" onChange={handleChange} required className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" />
        </div>
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input name="specialization" placeholder="Specialization" onChange={handleChange} required className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" />
          <input name="licenseNumber" placeholder="License Number" onChange={handleChange} required className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" />
        </div>
        <button type="submit" disabled={loading} className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500">
          {loading ? <Spinner /> : 'Submit for Review'}
        </button>
      </form>
      {error && <p className="text-sm text-center text-red-400">{error}</p>}
      {message && <p className="text-sm text-center text-green-400">{message}</p>}
      <p className="mt-4 text-sm text-center text-gray-400">
        Already have an account?{' '}
        <button onClick={() => setPage('login')} className="font-medium text-blue-400 hover:underline">Login</button>
      </p>
    </div>
  );
};

export default DoctorRegisterPage;