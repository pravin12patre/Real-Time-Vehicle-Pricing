import React, { useState, useEffect, useCallback } from 'react';
import { Car, TrendingUp, TrendingDown, DollarSign, Calendar, MapPin, Users, Settings, BarChart3, Activity } from 'lucide-react';
import LoginPage from './LoginPage'; // Adjust path if created elsewhere
import RegisterPage from './RegisterPage'; // Adjust path

const VehiclePricingSystem = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [pricingStrategy, setPricingStrategy] = useState('dynamic');
  const [marketData, setMarketData] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('main'); // 'main', 'login', 'register'
  const [realTimeFactors, setRealTimeFactors] = useState({
    demandMultiplier: 1.0,
    seasonalAdjustment: 1.0,
    competitorPricing: 1.0,
    inventoryLevel: 1.0
  });
  const [inventoryVehicles, setInventoryVehicles] = useState([]);

  // Fetch vehicle data on component mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/vehicles'); // New API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} while fetching from /api/vehicles`);
        }
        const data = await response.json();
        setInventoryVehicles(data);
      } catch (error) {
        console.error("Could not fetch vehicles from API:", error);
        // Optionally, set an error state here to display a message to the user
        // For example: setErrorState("Failed to load vehicle data. Please try again later.");
      }
    };

    fetchVehicles();
  }, []); // Empty dependency array ensures this runs once on mount

  // Pricing algorithm
  const calculateDynamicPrice = useCallback((vehicle, currentPricingStrategy) => {
    let price = vehicle.basePrice;
    
    const categoryMultipliers = {
      'Electric': 1.1,
      'Luxury': 1.2,
      'SUV': 1.05,
      'Truck': 1.08,
      'Sedan': 1.0,
      'Hybrid': 1.06,
      'Convertible': 1.15
    };
    const categoryMultiplier = categoryMultipliers[vehicle.category] || 1.0;

    switch (currentPricingStrategy) {
      case 'dynamic':
        // Demand-based adjustment
        const demandFactor = vehicle.demand / 100;
        price *= (0.8 + 0.4 * demandFactor);

        // Inventory-based adjustment
        const inventoryFactor = Math.max(0.1, vehicle.inventory / 50);
        price *= (1.3 - 0.3 * inventoryFactor);

        // Apply all real-time factors
        price *= realTimeFactors.demandMultiplier;
        price *= realTimeFactors.seasonalAdjustment;
        price *= realTimeFactors.competitorPricing;
        price *= realTimeFactors.inventoryLevel;

        price *= categoryMultiplier;
        break;

      case 'competitive':
        price *= realTimeFactors.competitorPricing;
        // Dampened demand multiplier: average with 1.0
        price *= ((realTimeFactors.demandMultiplier + 1) / 2);
        // Dampened inventory level: average with 1.0 or use a smaller modifier
        price *= ((realTimeFactors.inventoryLevel + 1) / 2);
        price *= categoryMultiplier;
        break;

      case 'fixed':
        price *= realTimeFactors.seasonalAdjustment;
        price *= categoryMultiplier;
        // Optional: Add a small fixed markup if desired, e.g., price *= 1.05;
        break;

      default: // Default to dynamic if strategy is unknown
        const defaultDemandFactor = vehicle.demand / 100;
        price *= (0.8 + 0.4 * defaultDemandFactor);
        const defaultInventoryFactor = Math.max(0.1, vehicle.inventory / 50);
        price *= (1.3 - 0.3 * defaultInventoryFactor);
        price *= realTimeFactors.demandMultiplier;
        price *= realTimeFactors.seasonalAdjustment;
        price *= realTimeFactors.competitorPricing;
        price *= realTimeFactors.inventoryLevel;
        price *= categoryMultiplier;
        break;
    }
    
    return Math.round(price);
  }, [realTimeFactors]);

  const handleLoginSuccess = (username) => {
    setCurrentUser(username);
    setView('main'); // Switch back to main view after login
  };
  const handleRegisterSuccess = (username) => {
    // setCurrentUser(username); // Or prompt to login
    setView('login'); // Switch to login view after registration
    alert('Registration successful. Please log in.');
  };
  const handleLogout = () => {
    localStorage.removeItem('vehicleAuthToken');
    setCurrentUser(null);
    setView('main');
  };

  // Simulate real-time market changes
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeFactors(prev => ({
        demandMultiplier: Math.max(0.8, Math.min(1.3, prev.demandMultiplier + (Math.random() - 0.5) * 0.05)),
        seasonalAdjustment: Math.max(0.9, Math.min(1.2, prev.seasonalAdjustment + (Math.random() - 0.5) * 0.02)),
        competitorPricing: Math.max(0.85, Math.min(1.15, prev.competitorPricing + (Math.random() - 0.5) * 0.03)),
        inventoryLevel: Math.max(0.9, Math.min(1.1, prev.inventoryLevel + (Math.random() - 0.5) * 0.02))
      }));

      // Update price history for selected vehicle
      if (selectedVehicle) {
        const newPrice = calculateDynamicPrice(selectedVehicle, pricingStrategy);
        const newPriceEntry = { price: newPrice, timestamp: new Date().toLocaleTimeString() };

        setMarketData(prevMarketData => {
          const currentHistory = prevMarketData[selectedVehicle.id] || [];
          const updatedHistory = [...currentHistory, newPriceEntry].slice(-5); // Keep last 5 entries
          return { ...prevMarketData, [selectedVehicle.id]: updatedHistory };
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedVehicle, pricingStrategy, calculateDynamicPrice]); // Added dependencies

  // Pass pricingStrategy to getPriceChange
  const getPriceChange = (vehicle, currentPricingStrategy) => {
    const currentPrice = calculateDynamicPrice(vehicle, currentPricingStrategy);
    const basePrice = vehicle.basePrice;
    const change = ((currentPrice - basePrice) / basePrice) * 100;
    return {
      amount: Math.abs(change),
      direction: change >= 0 ? 'up' : 'down',
      price: currentPrice
    };
  };

  const getDemandColor = (demand) => {
    if (demand >= 80) return 'text-red-600 bg-red-50';
    if (demand >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getInventoryColor = (inventory) => {
    if (inventory <= 10) return 'text-red-600 bg-red-50';
    if (inventory <= 20) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      {view === 'login' && <LoginPage onLoginSuccess={handleLoginSuccess} />}
      {view === 'register' && <RegisterPage onRegisterSuccess={handleRegisterSuccess} />}
      {view === 'main' && (
      <>
        <div style={{ padding: '10px', textAlign: 'right', maxWidth: '7xl', margin: 'auto' }}>
          {currentUser ? (
            <>
              <span style={{ marginRight: '10px' }}>Logged in as: {currentUser} </span>
              <button onClick={handleLogout} style={{ padding: '5px 10px', cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => setView('login')} style={{ padding: '5px 10px', cursor: 'pointer' }}>Login</button>
              <button onClick={() => setView('register')} style={{ marginLeft: '10px', padding: '5px 10px', cursor: 'pointer' }}>Register</button>
            </>
          )}
        </div>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-600 rounded-xl">
                <Car className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Vehicle Pricing System</h1>
                <p className="text-gray-600">Real-time dynamic pricing engine</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(realTimeFactors.demandMultiplier * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Market Activity</div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle Inventory */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Vehicle Inventory</h2>
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-gray-400" />
                  <select 
                    value={pricingStrategy} 
                    onChange={(e) => setPricingStrategy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="dynamic">Dynamic Pricing</option>
                    <option value="competitive">Competitive Pricing</option>
                    <option value="fixed">Fixed Pricing</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4">
                {inventoryVehicles.map((vehicle) => {
                  // Pass pricingStrategy to getPriceChange here
                  const priceInfo = getPriceChange(vehicle, pricingStrategy);
                  return (
                    <div
                      key={vehicle.id}
                      className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                        selectedVehicle?.id === vehicle.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        // Add initial price to history on selection
                        const initialPrice = calculateDynamicPrice(vehicle, pricingStrategy);
                        const initialPriceEntry = { price: initialPrice, timestamp: new Date().toLocaleTimeString() };
                        setMarketData(prevMarketData => ({
                          ...prevMarketData,
                          [vehicle.id]: [initialPriceEntry] // Start new history or overwrite existing
                        }));
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h3>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                              {vehicle.category}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{vehicle.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className={`h-4 w-4 rounded px-2 py-1 text-xs font-medium ${getDemandColor(vehicle.demand)}`} />
                              <span className="text-sm text-gray-600">Demand: {vehicle.demand}%</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <BarChart3 className={`h-4 w-4 rounded px-2 py-1 text-xs font-medium ${getInventoryColor(vehicle.inventory)}`} />
                              <span className="text-sm text-gray-600">Stock: {vehicle.inventory}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">Updated: Now</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right ml-6">
                          <div className="flex items-center space-x-2 mb-1">
                            {priceInfo.direction === 'up' ? (
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            )}
                            <span className={`text-sm font-medium ${
                              priceInfo.direction === 'up' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {priceInfo.direction === 'up' ? '+' : '-'}{priceInfo.amount.toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-3xl font-bold text-gray-900">
                            ${priceInfo.price.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Base: ${vehicle.basePrice.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Real-time Factors & Controls */}
          <div className="space-y-6">
            {/* Market Factors */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Market Factors</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Demand Multiplier</span>
                    <span className="text-sm text-gray-500">{(realTimeFactors.demandMultiplier * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((realTimeFactors.demandMultiplier - 0.8) / 0.5) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Seasonal Adjustment</span>
                    <span className="text-sm text-gray-500">{(realTimeFactors.seasonalAdjustment * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((realTimeFactors.seasonalAdjustment - 0.9) / 0.3) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Competitor Pricing</span>
                    <span className="text-sm text-gray-500">{(realTimeFactors.competitorPricing * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((realTimeFactors.competitorPricing - 0.85) / 0.3) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Inventory Level</span>
                    <span className="text-sm text-gray-500">{(realTimeFactors.inventoryLevel * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((realTimeFactors.inventoryLevel - 0.9) / 0.2) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Vehicle Details */}
            {selectedVehicle && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Pricing Breakdown</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-medium">${selectedVehicle.basePrice.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Demand Adjustment</span>
                    <span className="font-medium text-blue-600">
                      {selectedVehicle.demand >= 75 ? '+' : ''}
                      {((selectedVehicle.demand / 100 - 0.75) * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inventory Impact</span>
                    <span className="font-medium text-orange-600">
                      {selectedVehicle.inventory <= 15 ? '+' : '-'}
                      {Math.abs(((15 - selectedVehicle.inventory) / 35) * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Factors</span>
                    <span className="font-medium text-purple-600">
                      {((Object.values(realTimeFactors).reduce((a, b) => a * b, 1) - 1) * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <hr className="my-3" />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Final Price</span>
                    <span className="text-green-600">
                      {/* Pass pricingStrategy to calculateDynamicPrice here */}
                      ${calculateDynamicPrice(selectedVehicle, pricingStrategy).toLocaleString()}
                    </span>
                  </div>

                  {/* Price History Display */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-md font-semibold text-gray-800 mb-2">Recent Price History:</h4>
                    {marketData[selectedVehicle.id] && marketData[selectedVehicle.id].length > 0 ? (
                      <ul className="space-y-1 text-sm text-gray-600">
                        {marketData[selectedVehicle.id].map((entry, index) => (
                          <li key={index} className="flex justify-between">
                            <span>{entry.timestamp}</span>
                            <span>${entry.price.toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No price history yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">System Stats</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{inventoryVehicles.length}</div>
                  <div className="text-sm text-gray-600">Active Vehicles</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {/* Pass pricingStrategy to calculateDynamicPrice here */}
                    {inventoryVehicles.reduce((sum, v) => sum + calculateDynamicPrice(v, pricingStrategy), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Value</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {inventoryVehicles.length > 0 ? Math.round(inventoryVehicles.reduce((sum, v) => sum + v.demand, 0) / inventoryVehicles.length) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Demand</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {inventoryVehicles.reduce((sum, v) => sum + v.inventory, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Stock</div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </>
      )}
    </div>
  );
};

export default VehiclePricingSystem;
