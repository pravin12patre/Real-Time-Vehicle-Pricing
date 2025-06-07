// src/RegisterPage.js (or components/auth/RegisterPage.js)
import React, { useState } from 'react';

const RegisterPage = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Registration failed');
      }
      localStorage.setItem('vehicleAuthToken', data.token); // Store token
      if(onRegisterSuccess) onRegisterSuccess(username); // Callback to parent
      alert('Registration successful! Token stored. You can now log in or are auto-logged in.'); // Simple feedback
    } catch (err) {
      setError(err.message);
      console.error('Registration error:', err);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '300px', margin: 'auto', border: '1px solid #ccc', borderRadius: '8px', marginTop: '50px' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="reg_username" style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
          <input type="text" id="reg_username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="reg_password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input type="password" id="reg_password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}/>
        </div>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <button type="submit" style={{ marginTop: '20px', padding: '10px 15px', width: '100%', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
