// src/LoginPage.js (or components/auth/LoginPage.js)
import React, { useState } from 'react';

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

import { apiService } from './apiService'; // Import apiService

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Set loading to true
    try {
      const data = await apiService.login({ username, password }); // Use apiService
      localStorage.setItem('vehicleAuthToken', data.token); // Store token
      if(onLoginSuccess) onLoginSuccess(username); // Callback to parent
      alert('Login successful! Token stored.'); // Simple feedback
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false); // Set loading to false
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '300px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px', marginTop: '50px' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            <button type="submit" style={{ marginTop: '20px', padding: '10px 15px', width: '100%', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
      </form>
    </div>
  );
};

export default LoginPage;
