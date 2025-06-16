// src/AdminDashboardPage.js
import React, { useState, useEffect } from 'react';
import { apiService } from './apiService'; // Assuming apiService.js is in src/

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await apiService.get('/admin/stats'); // Uses JWT via apiService
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch statistics. You may not have admin privileges or the server encountered an error.');
        console.error('Fetch stats error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []); // Fetch stats on component mount

  if (isLoading) {
    return <p style={{ padding: '20px', textAlign: 'center' }}>Loading dashboard data...</p>;
  }

  if (error) {
    return <p style={{ padding: '20px', color: 'red', textAlign: 'center' }}>Error: {error}</p>;
  }

  if (!stats) {
    return <p style={{ padding: '20px', textAlign: 'center' }}>No statistics data available.</p>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '20px auto', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Admin Dashboard</h2>

      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Overall Statistics</h3>
        <p style={{ fontSize: '1.1em', marginBottom: '8px' }}><strong>Total Registered Users:</strong> {stats.userCount !== undefined ? stats.userCount : 'N/A'}</p>
        <p style={{ fontSize: '1.1em' }}><strong>Total Vehicle Listings:</strong> {stats.vehicleCount !== undefined ? stats.vehicleCount : 'N/A'}</p>
      </div>

      {stats.vehiclesByCategory && stats.vehiclesByCategory.length > 0 && (
        <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#555', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Vehicles by Category</h3>
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {stats.vehiclesByCategory.map(categoryStat => (
              <li key={categoryStat._id || categoryStat.category} style={{ marginBottom: '8px', padding: '8px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', fontSize: '1.05em' }}>
                <span><strong>{categoryStat._id || categoryStat.category}:</strong></span>
                <span>{categoryStat.count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Add more stats or admin links here in the future */}
    </div>
  );
};

export default AdminDashboardPage;
