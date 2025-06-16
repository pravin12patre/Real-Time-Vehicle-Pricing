import React, { useState, useEffect, useCallback } from 'react';
import { Car, TrendingUp, TrendingDown, DollarSign, Calendar, MapPin, Users, Settings, BarChart3, Activity, PlusCircle, Edit3, Trash2 } from 'lucide-react'; // Added icons
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import AddVehiclePage from './AddVehiclePage';
import EditVehiclePage from './EditVehiclePage';
import AdminDashboardPage from './AdminDashboardPage';
import VehicleFilter from './VehicleFilter'; // Import VehicleFilter
import { apiService } from './apiService';

const defaultFilters = {
  keyword: '', category: '', minPrice: '', maxPrice: '',
  minYear: '', maxYear: '', sortBy: 'createdAt', sortOrder: 'desc'
};

const VehiclePricingSystem = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [pricingStrategy, setPricingStrategy] = useState('dynamic');
  const [marketData, setMarketData] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('main'); // 'main', 'login', 'register', 'addVehicle', 'editVehicle', 'adminDashboard'
  const [realTimeFactors, setRealTimeFactors] = useState({
    demandMultiplier: 1.0,
    seasonalAdjustment: 1.0,
    competitorPricing: 1.0,
    inventoryLevel: 1.0
  });
  const [inventoryVehicles, setInventoryVehicles] = useState([]);
  const [vehicleIdToEdit, setVehicleIdToEdit] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [filterParams, setFilterParams] = useState(defaultFilters);


  const fetchInventoryVehicles = useCallback(async (filtersToApply) => {
    setFetchError(null);
    try {
      const data = await apiService.get('/vehicles', filtersToApply);
      setInventoryVehicles(data);
    } catch (error) {
      console.error("Could not fetch vehicles from API with filters:", error);
      setFetchError(error.message || "Failed to load filtered vehicles.");
      setInventoryVehicles([]); // Clear vehicles on error
    }
  }, []);

  useEffect(() => {
    fetchInventoryVehicles(filterParams); // Use filterParams state for initial fetch
    // Check for existing token and user info on mount
    const token = localStorage.getItem('vehicleAuthToken');
    const storedUser = localStorage.getItem('vehicleUser');
    if (token && storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user data:", e);
        localStorage.removeItem('vehicleUser'); // Clear corrupted data
        localStorage.removeItem('vehicleAuthToken');
      }
    }
  }, [fetchInventoryVehicles, filterParams]); // Add filterParams to re-fetch if they were to change from other sources

  const handleFilterChange = (newFilters) => {
    setFilterParams(newFilters);
    fetchInventoryVehicles(newFilters);
  };

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

  const handleLoginSuccess = (userData) => { // Expects { id, username, role }
    setCurrentUser(userData);
    setView('main');
    fetchInventoryVehicles();
  };
  const handleRegisterSuccess = (username) => { // username is passed but not used to set currentUser
    setView('login');
    alert('Registration successful. Please log in.');
  };
  const handleLogout = () => {
    localStorage.removeItem('vehicleAuthToken');
    localStorage.removeItem('vehicleUser');
    setCurrentUser(null);
    setView('main');
    setSelectedVehicle(null);
    setMarketData({});
    setVehicleIdToEdit(null);
  };

  const navigateToAdminDashboard = () => {
    setSelectedVehicle(null); // Clear any selected vehicle
    setVehicleIdToEdit(null); // Clear any vehicle ID being edited
    setView('adminDashboard');
  };

  // CRUD view handlers
  const openAddVehiclePage = () => {
    setSelectedVehicle(null); // Clear selection when opening add page
    setVehicleIdToEdit(null);
    setView('addVehicle');
  };
  const openEditVehiclePage = (id) => {
    setSelectedVehicle(null); // Clear selection when opening edit page
    setVehicleIdToEdit(id);
    setView('editVehicle');
  };
  const handleVehicleAdded = () => { fetchInventoryVehicles(); setView('main'); };
  const handleVehicleUpdated = () => { fetchInventoryVehicles(); setVehicleIdToEdit(null); setView('main'); };
  const handleCrudCancel = () => { setVehicleIdToEdit(null); setView('main'); };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await apiService.delete(`/vehicles/${id}`);
        alert('Vehicle deleted successfully.');
        fetchInventoryVehicles();
        if(selectedVehicle && selectedVehicle._id === id) {
          setSelectedVehicle(null);
        }
      } catch (error) {
        alert(`Failed to delete vehicle: ${error.message}`);
        console.error('Delete vehicle error:', error);
      }
    }
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
      if (selectedVehicle && selectedVehicle._id) { // Check if _id exists
        const newPrice = calculateDynamicPrice(selectedVehicle, pricingStrategy);
        const newPriceEntry = { price: newPrice, timestamp: new Date().toLocaleTimeString() };

        setMarketData(prevMarketData => {
          const currentHistory = prevMarketData[selectedVehicle._id] || []; // Use _id
          const updatedHistory = [...currentHistory, newPriceEntry].slice(-5);
          return { ...prevMarketData, [selectedVehicle._id]: updatedHistory }; // Use _id
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

  if (view === 'login') return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  if (view === 'register') return <RegisterPage onRegisterSuccess={handleRegisterSuccess} />;

  if (view === 'addVehicle') {
    if (currentUser && currentUser.role === 'admin') {
      return <AddVehiclePage onVehicleAdded={handleVehicleAdded} onCancel={handleCrudCancel} />;
    } else {
      alert('Access Denied: Admins only.'); setView('main'); return null;
    }
  }
  if (view === 'editVehicle') {
    if (currentUser && currentUser.role === 'admin') {
      return <EditVehiclePage vehicleIdToEdit={vehicleIdToEdit} onVehicleUpdated={handleVehicleUpdated} onCancel={handleCrudCancel} />;
    } else {
      alert('Access Denied: Admins only.'); setView('main'); return null;
    }
  }
  if (view === 'adminDashboard') {
    if (currentUser && currentUser.role === 'admin') {
      return <AdminDashboardPage />;
    } else {
      alert('Access Denied: Admins only.'); setView('main'); return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      {/* User/Auth Controls */}
      <div style={{ padding: '10px', textAlign: 'right', maxWidth: 'calc(100% - 2rem)', margin: '0 auto 1rem auto' }} className="max-w-7xl">
        {currentUser ? (
          <>
            <span style={{ marginRight: '10px' }}>Logged in as: {currentUser.username} (Role: {currentUser.role}) </span>
            {currentUser.role === 'admin' && (
              <button
                onClick={navigateToAdminDashboard}
                style={{ marginLeft: '10px', padding: '8px 12px', cursor: 'pointer', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Admin Dashboard
              </button>
            )}
            <button onClick={handleLogout} style={{ marginLeft: '10px', padding: '8px 12px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => setView('login')} style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>Login</button>
            <button onClick={() => setView('register')} style={{ marginLeft: '10px', padding: '8px 12px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Register</button>
          </>
        )}
      </div>

      {/* Main Content Area */}
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
              {/* Moved Add Vehicle Button and Pricing Strategy Dropdown into this div */}
              {/* Moved Add Vehicle Button and Pricing Strategy Dropdown into this div */}
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-gray-900">Vehicle Inventory</h2>
                 <div className="flex items-center space-x-2">
                  {currentUser && currentUser.role === 'admin' && (
                    <button
                      onClick={openAddVehiclePage}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md flex items-center transition ease-in-out duration-150"
                    >
                      <PlusCircle className="h-5 w-5 mr-2" /> Add Vehicle
                    </button>
                  )}
                  <Settings className="h-5 w-5 text-gray-400" />
                  <select 
                    value={pricingStrategy} 
                    onChange={(e) => setPricingStrategy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="dynamic">Dynamic Pricing</option>
                    <option value="competitive">Competitive Pricing</option>
                    <option value="fixed">Fixed Pricing</option>
                  </select>
                </div>
              </div>

              <VehicleFilter onFilterChange={handleFilterChange} initialFilters={filterParams} />

              {fetchError && <div className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{fetchError}</div>}

              <div className="grid gap-4">
                {inventoryVehicles.map((vehicle) => {
                  const priceInfo = getPriceChange(vehicle, pricingStrategy);
                  return (
                    <div
                      key={vehicle._id} // Use _id for MongoDB IDs
                      className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                        selectedVehicle?._id === vehicle._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        if (vehicle._id) { // Ensure _id is present for history key
                          const initialPrice = calculateDynamicPrice(vehicle, pricingStrategy);
                          const initialPriceEntry = { price: initialPrice, timestamp: new Date().toLocaleTimeString() };
                          setMarketData(prevMarketData => ({
                            ...prevMarketData,
                            [vehicle._id]: [initialPriceEntry]
                          }));
                        }
                      }}
                    >
                      {vehicle.imageUrl && (
                        <img
                          src={`http://localhost:5000${vehicle.imageUrl}`}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          style={{
                            width: '100%',
                            maxHeight: '200px',
                            objectFit: 'cover',
                            borderRadius: '8px 8px 0 0', // Rounded top corners if card has rounded corners
                            marginBottom: '1rem'
                          }}
                          onError={(e) => { e.target.style.display = 'none'; }} // Hide if image fails to load
                        />
                      )}
                      <div className="flex items-center justify-between">
                        {/* Adjust padding if image is present, or wrap content below image */}
                        <div className="flex-1 pt-2"> {/* Added padding-top if image is above */}
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </h3>
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                              {vehicle.category}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-gray-600">
                            <div><MapPin className="h-4 w-4 inline mr-1 text-gray-400" />{vehicle.location}</div>
                            <div><Users className={`h-4 w-4 inline mr-1 ${getDemandColor(vehicle.demand).split(' ')[0]}`} />Demand: {vehicle.demand}%</div>
                            <div><BarChart3 className={`h-4 w-4 inline mr-1 ${getInventoryColor(vehicle.inventory).split(' ')[0]}`} />Stock: {vehicle.inventory}</div>
                            <div><Calendar className="h-4 w-4 inline mr-1 text-gray-400" />Updated: Now</div>
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
                           {currentUser && currentUser.role === 'admin' && (
                            <div className="mt-3 space-x-2">
                              <button onClick={(e) => { e.stopPropagation(); openEditVehiclePage(vehicle._id); }} className="text-xs bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-1 px-2 rounded flex items-center shadow transition ease-in-out duration-150"><Edit3 size={12} className="mr-1"/> Edit</button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteVehicle(vehicle._id); }} className="text-xs bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded flex items-center shadow transition ease-in-out duration-150"><Trash2 size={12} className="mr-1"/> Delete</button>
                            </div>
                          )}
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
                {/* Factor items */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Demand Multiplier</span>
                    <span className="text-sm text-gray-500">{(realTimeFactors.demandMultiplier * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((realTimeFactors.demandMultiplier - 0.8) / 0.5) * 100}%` }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Seasonal Adjustment</span>
                    <span className="text-sm text-gray-500">{(realTimeFactors.seasonalAdjustment * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((realTimeFactors.seasonalAdjustment - 0.9) / 0.3) * 100}%` }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Competitor Pricing</span>
                    <span className="text-sm text-gray-500">{(realTimeFactors.competitorPricing * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((realTimeFactors.competitorPricing - 0.85) / 0.3) * 100}%` }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Inventory Level</span>
                    <span className="text-sm text-gray-500">{(realTimeFactors.inventoryLevel * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-orange-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((realTimeFactors.inventoryLevel - 0.9) / 0.2) * 100}%` }}></div></div>
                </div>
              </div>
            </div>

            {/* Selected Vehicle Details */}
            {selectedVehicle && selectedVehicle._id && ( // Ensure selectedVehicle and _id exist
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Pricing Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-gray-600">Base Price</span><span className="font-medium">${selectedVehicle.basePrice.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Demand Adjustment</span><span className="font-medium text-blue-600">{selectedVehicle.demand >= 75 ? '+' : ''}{((selectedVehicle.demand / 100 - 0.75) * 100).toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Inventory Impact</span><span className="font-medium text-orange-600">{selectedVehicle.inventory <= 15 ? '+' : '-'}{Math.abs(((15 - selectedVehicle.inventory) / 35) * 100).toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Market Factors</span><span className="font-medium text-purple-600">{((Object.values(realTimeFactors).reduce((a, b) => a * b, 1) - 1) * 100).toFixed(1)}%</span></div>
                  <hr className="my-3" />
                  <div className="flex justify-between text-lg font-bold"><span>Final Price</span><span className="text-green-600">${calculateDynamicPrice(selectedVehicle, pricingStrategy).toLocaleString()}</span></div>
                  {/* Price History Display */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-md font-semibold text-gray-800 mb-2">Recent Price History:</h4>
                    {marketData[selectedVehicle._id] && marketData[selectedVehicle._id].length > 0 ? (
                      <ul className="space-y-1 text-sm text-gray-600">
                        {marketData[selectedVehicle._id].map((entry, index) => (
                          <li key={index} className="flex justify-between"><span>{entry.timestamp}</span><span>${entry.price.toLocaleString()}</span></li>
                        ))}
                      </ul>
                    ) : (<p className="text-sm text-gray-500">No price history yet.</p>)}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">System Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg"><div className="text-2xl font-bold text-blue-600">{inventoryVehicles.length}</div><div className="text-sm text-gray-600">Active Vehicles</div></div>
                <div className="text-center p-3 bg-green-50 rounded-lg"><div className="text-2xl font-bold text-green-600">{inventoryVehicles.reduce((sum, v) => sum + calculateDynamicPrice(v, pricingStrategy), 0).toLocaleString()}</div><div className="text-sm text-gray-600">Total Value</div></div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg"><div className="text-2xl font-bold text-yellow-600">{inventoryVehicles.length > 0 ? Math.round(inventoryVehicles.reduce((sum, v) => sum + v.demand, 0) / inventoryVehicles.length) : 0}%</div><div className="text-sm text-gray-600">Avg Demand</div></div>
                <div className="text-center p-3 bg-purple-50 rounded-lg"><div className="text-2xl font-bold text-purple-600">{inventoryVehicles.reduce((sum, v) => sum + v.inventory, 0)}</div><div className="text-sm text-gray-600">Total Stock</div></div>
              </div>
            </div>
          </div>
        </div>
      {/* </>) */} {/* Removed incorrect closing tag from original structure if view === 'main' */}
    </div>
  );
};

export default VehiclePricingSystem;
