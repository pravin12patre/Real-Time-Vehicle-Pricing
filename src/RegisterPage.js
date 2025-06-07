// src/RegisterPage.js (or components/auth/RegisterPage.js)
import React, { useState } from 'react';

const RegisterPage = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

import { apiService } from './apiService'; // Import apiService

const RegisterPage = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Set loading to true
    try {
      // Assuming apiService.register handles the response and throws error if not ok
      const data = await apiService.register({ username, password }); // Use apiService

      // Typically, after registration, you might not store the token directly
      // or you might, if the backend auto-logs in the user and returns a token.
      // The current backend authController.registerUser does return a token.
      localStorage.setItem('vehicleAuthToken', data.token);

      if(onRegisterSuccess) onRegisterSuccess(username);
      alert('Registration successful! Token stored. You can now log in.');
    } catch (err) {
      setError(err.message);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false); // Set loading to false
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
            <button type="submit" style={{ marginTop: '20px', padding: '10px 15px', width: '100%', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'}
            </button>
      </form>
    </div>
  );
};

export default RegisterPage;
