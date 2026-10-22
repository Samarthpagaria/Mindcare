// src/components/auth/UserSignup.jsx
import React, { useState } from 'react';
import axios from 'axios';
import Spinner from '../common/Spinner';

const UserSignupPage = ({ setPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:5001/api/auth';

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/register-user`, { email, password, firstName, lastName });
      setMessage(response.data.message);
      setTimeout(() => setPage('login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-white">Create Your Account</h2>
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="flex space-x-4">
          <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" required className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" />
          <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" required className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" />
        </div>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md" />
        <button type="submit" disabled={loading} className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500">
          {loading ? <Spinner /> : 'Sign Up'}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-center text-red-400">{error}</p>}
      {message && <p className="mt-4 text-sm text-center text-green-400">{message}</p>}
      <p className="mt-4 text-sm text-center text-gray-400">
        Already have an account?{' '}
        <button onClick={() => setPage('login')} className="font-medium text-blue-400 hover:underline">Login</button>
      </p>
    </div>
  );
};

export default UserSignupPage;