import React from 'react'

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">Real-Time Vehicle Pricing</div>
        <div className="nav-links">
          <a href="#" className="nav-link">Dashboard</a>
          <a href="#" className="nav-link">Vehicles</a>
          <a href="#" className="nav-link">Pricing</a>
          <a href="#" className="nav-link">Analytics</a>
        </div>
      </nav>

      <main className="main-content">
        <div className="content-header">
          <h1>Welcome to Real-Time Vehicle Pricing</h1>
          <p>Monitor and adjust vehicle prices in real-time based on market conditions</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Total Vehicles</h3>
            <div className="card-value">1,234</div>
            <div className="card-trend positive">+12% from last month</div>
          </div>
          
          <div className="dashboard-card">
            <h3>Average Price</h3>
            <div className="card-value">$45,678</div>
            <div className="card-trend positive">+5% from last month</div>
          </div>
          
          <div className="dashboard-card">
            <h3>Price Adjustments</h3>
            <div className="card-value">89</div>
            <div className="card-trend negative">-3% from last month</div>
          </div>
          
          <div className="dashboard-card">
            <h3>Market Demand</h3>
            <div className="card-value">High</div>
            <div className="card-trend positive">+8% from last month</div>
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">🚗</div>
              <div className="activity-details">
                <div className="activity-title">Price Updated</div>
                <div className="activity-description">2023 Toyota Camry price adjusted to $28,500</div>
                <div className="activity-time">2 minutes ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📊</div>
              <div className="activity-details">
                <div className="activity-title">Market Analysis</div>
                <div className="activity-description">New market trends detected for SUVs</div>
                <div className="activity-time">15 minutes ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">💰</div>
              <div className="activity-details">
                <div className="activity-title">Price Alert</div>
                <div className="activity-description">Competitor price change detected for Honda Civic</div>
                <div className="activity-time">1 hour ago</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App 