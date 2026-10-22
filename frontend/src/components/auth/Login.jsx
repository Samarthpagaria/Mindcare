// src/components/auth/Login.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase';
import Spinner from '../common/Spinner';
const LoginPage = ({ setPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-white">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md" />
        </div>
        <button type="submit" disabled={loading} className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500">
          {loading ? <Spinner /> : 'Login'}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-center text-red-400">{error}</p>}
      <p className="mt-4 text-sm text-center text-gray-400">
        Need an account?{' '}
        <button onClick={() => setPage('signup')} className="font-medium text-blue-400 hover:underline">Sign Up</button> or{' '}
        <button onClick={() => setPage('doctor-register')} className="font-medium text-blue-400 hover:underline">Register as a Doctor</button>
      </p>
    </div>
  );
};

export default LoginPage;