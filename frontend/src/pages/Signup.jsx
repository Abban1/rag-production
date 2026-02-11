import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      setError('');
      const res = await axios.post('http://localhost:8000/auth/signup', { email, password });
      console.log('Signup response:', res.data);
      alert("Signup Successful! Please login.");
      navigate('/login');
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.detail || "Signup Failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-semibold mb-4">Signup</h2>
        {error && <div className="text-red-500 mb-3 text-sm">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />
        <button
          onClick={handleSignup}
          className="bg-red-600 text-white w-full py-2 rounded hover:bg-red-700"
        >
          Signup
        </button>
        <p className="text-sm mt-4">
          Already have an account? <a href="/login" className="text-blue-600">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;