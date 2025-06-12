// src/AddVehiclePage.js
import React, { useState } from 'react';
import { apiService } from './apiService'; // Assuming apiService.js is in the same src/ directory

const AddVehiclePage = ({ onVehicleAdded, onCancel }) => {
  const [vehicle, setVehicle] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(), // Default to current year
    basePrice: '',
    category: 'Sedan', // Default category
    inventory: '',
    demand: '',
    location: '',
    imageUrl: '' // Initialize imageUrl
  });
  const [error, setError] = useState(''); // For main form errors
  const [isLoading, setIsLoading] = useState(false); // For main form submission
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false); // For image upload
  const [imageUploadError, setImageUploadError] = useState('');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setVehicle(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!vehicle.make || !vehicle.model || !vehicle.basePrice || !vehicle.category || vehicle.inventory === '' || vehicle.demand === '') {
        setError('Please fill in all required fields (Make, Model, Base Price, Category, Inventory, Demand).');
        setIsLoading(false);
        return;
    }
    if (vehicle.year < 1900 || vehicle.year > new Date().getFullYear() + 1) {
        setError('Please enter a valid year.');
        setIsLoading(false);
        return;
    }
    if (vehicle.basePrice <= 0 || vehicle.inventory < 0 || vehicle.demand < 0 || vehicle.demand > 100) {
        setError('Please enter valid numbers for Price (>0), Inventory (>=0), and Demand (0-100).');
        setIsLoading(false);
        return;
    }


    try {
      // Ensure numeric fields are numbers as expected by backend
      const vehicleData = {
        ...vehicle,
        year: parseInt(vehicle.year, 10),
        basePrice: parseFloat(vehicle.basePrice),
        inventory: parseInt(vehicle.inventory, 10),
        demand: parseInt(vehicle.demand, 10),
      };

      await apiService.post('/vehicles', vehicleData);
      alert('Vehicle added successfully!');
      if (onVehicleAdded) {
        onVehicleAdded(); // Callback to refresh list and switch view
      }
      // Optionally reset form:
      // setVehicle({ make: '', model: '', year: 2024, basePrice: '', category: 'Sedan', inventory: '', demand: '', location: '' });
    } catch (err) {
      setError(err.message || 'Failed to add vehicle. Ensure you are logged in and have permissions.');
      console.error('Add vehicle error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUploadError(''); // Clear previous error
      handleImageUpload(file); // Trigger upload immediately
    } else {
      setSelectedFile(null);
      setImagePreview('');
      // Optionally clear vehicle.imageUrl if no file is selected,
      // or if the user explicitly removes a file.
      // For now, this only handles new file selection.
    }
  };

  const handleImageUpload = async (fileToUpload) => {
    if (!fileToUpload) return;
    setIsUploading(true);
    setImageUploadError('');
    const formData = new FormData();
    formData.append('vehicleImage', fileToUpload);

    try {
      const uploadResponse = await apiService.post('/upload/vehicle-image', formData);
      setVehicle(prev => ({ ...prev, imageUrl: uploadResponse.imageUrl }));
      // alert('Image uploaded successfully!'); // Consider removing if preview is enough
    } catch (err) {
      setImageUploadError(err.message || 'Image upload failed.');
      setSelectedFile(null);
      setImagePreview('');
      setVehicle(prev => ({ ...prev, imageUrl: '' })); // Clear stored URL on new upload error
    } finally {
      setIsUploading(false);
    }
  };

  // Categories available in the system (could be fetched or from a config)
  const categories = ['Sedan', 'Electric', 'SUV', 'Truck', 'Hybrid', 'Convertible', 'Luxury'];


  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '20px auto', maxWidth: '600px', backgroundColor: 'white' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Add New Vehicle</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>

        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="make" style={{ display: 'block', marginBottom: '5px' }}>Make:</label>
          <input type="text" id="make" name="make" value={vehicle.make} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="model" style={{ display: 'block', marginBottom: '5px' }}>Model:</label>
          <input type="text" id="model" name="model" value={vehicle.model} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label htmlFor="year" style={{ display: 'block', marginBottom: '5px' }}>Year:</label>
          <input type="number" id="year" name="year" value={vehicle.year} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label htmlFor="basePrice" style={{ display: 'block', marginBottom: '5px' }}>Base Price:</label>
          <input type="number" id="basePrice" name="basePrice" value={vehicle.basePrice} onChange={handleChange} required min="0.01" step="0.01" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label htmlFor="category" style={{ display: 'block', marginBottom: '5px' }}>Category:</label>
          <select id="category" name="category" value={vehicle.category} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="inventory" style={{ display: 'block', marginBottom: '5px' }}>Inventory:</label>
          <input type="number" id="inventory" name="inventory" value={vehicle.inventory} onChange={handleChange} required min="0" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label htmlFor="demand" style={{ display: 'block', marginBottom: '5px' }}>Demand (%):</label>
          <input type="number" id="demand" name="demand" value={vehicle.demand} onChange={handleChange} required min="0" max="100" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label htmlFor="location" style={{ display: 'block', marginBottom: '5px' }}>Location:</label>
          <input type="text" id="location" name="location" value={vehicle.location} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="vehicleImage" style={{ display: 'block', marginBottom: '5px' }}>Vehicle Image:</label>
          <input type="file" id="vehicleImage" name="vehicleImage" onChange={handleFileChange} accept="image/*" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} disabled={isUploading} />
          {isUploading && <p style={{ margin: '5px 0 0 0', fontStyle: 'italic' }}>Uploading image...</p>}
          {imageUploadError && <p style={{ color: 'red', margin: '5px 0 0 0' }}>{imageUploadError}</p>}
          {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', height: 'auto', marginTop: '10px', display: 'block' }} />}
          {!imagePreview && vehicle.imageUrl && <p style={{margin: '5px 0 0 0'}}>Current image: <a href={`http://localhost:5000${vehicle.imageUrl}`} target="_blank" rel="noopener noreferrer">{vehicle.imageUrl}</a></p>}
        </div>

        {error && <p style={{ color: 'red', gridColumn: '1 / -1', textAlign: 'center' }}>{error}</p>}

        <div style={{ marginTop: '20px', gridColumn: '1 / -1', textAlign: 'right' }}>
          <button type="submit" disabled={isLoading || isUploading} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {isLoading ? 'Adding...' : 'Add Vehicle'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} style={{ marginLeft: '10px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={isLoading || isUploading}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddVehiclePage;
