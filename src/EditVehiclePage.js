// src/EditVehiclePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from './apiService'; // Assuming apiService.js is in the same src/ directory

const EditVehiclePage = ({ vehicleIdToEdit, onVehicleUpdated, onCancel }) => {
  const [vehicle, setVehicle] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    basePrice: '',
    category: 'Sedan',
    inventory: '',
    demand: '',
    location: '',
    imageUrl: '' // Add imageUrl to initial state
  });
  const [originalVehicle, setOriginalVehicle] = useState(null);
  const [error, setError] = useState(''); // For main form errors
  const [isLoading, setIsLoading] = useState(false); // For main form submission
  const [isFetching, setIsFetching] = useState(false); // For initial data load
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false); // For image upload
  const [imageUploadError, setImageUploadError] = useState('');

  const fetchVehicleData = useCallback(async () => {
    if (!vehicleIdToEdit) return;
    setIsFetching(true);
    setError('');
    try {
      const data = await apiService.get(`/vehicles/${vehicleIdToEdit}`);
      setVehicle({
        make: data.make || '',
        model: data.model || '',
        year: data.year || new Date().getFullYear(),
        basePrice: data.basePrice === undefined ? '' : data.basePrice, // Handle 0 correctly
        category: data.category || 'Sedan',
        inventory: data.inventory === undefined ? '' : data.inventory,
        demand: data.demand === undefined ? '' : data.demand,
        location: data.location || '',
        imageUrl: data.imageUrl || '' // Populate imageUrl
      });
      setOriginalVehicle(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch vehicle data.');
      console.error('Fetch vehicle error:', err);
    } finally {
      setIsFetching(false);
    }
  }, [vehicleIdToEdit]);

  useEffect(() => {
    fetchVehicleData();
  }, [fetchVehicleData]);

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

    // Basic validation (similar to AddVehiclePage)
    if (!vehicle.make || !vehicle.model || vehicle.basePrice === '' || !vehicle.category || vehicle.inventory === '' || vehicle.demand === '') {
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
      const vehicleDataToUpdate = {
        ...vehicle,
        year: parseInt(vehicle.year, 10),
        basePrice: parseFloat(vehicle.basePrice),
        inventory: parseInt(vehicle.inventory, 10),
        demand: parseInt(vehicle.demand, 10),
      };

      await apiService.put(`/vehicles/${vehicleIdToEdit}`, vehicleDataToUpdate);
      alert('Vehicle updated successfully!');
      if (onVehicleUpdated) {
        onVehicleUpdated(); // Callback to refresh list and switch view
      }
    } catch (err) {
      setError(err.message || 'Failed to update vehicle. Ensure you are logged in and have permissions.');
      console.error('Update vehicle error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUploadError('');
      handleImageUpload(file); // Auto-upload on select
    } else {
      setSelectedFile(null);
      // If you want to revert to original image on deselect, you might clear imagePreview
      // and let the original vehicle.imageUrl take precedence in rendering.
      // setImagePreview(''); // This would clear preview if user cancels file dialog
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
      // alert('Image updated successfully!'); // Optional feedback
    } catch (err) {
      setImageUploadError(err.message || 'Image upload failed.');
      // Optionally revert selectedFile and imagePreview if upload fails
      // setSelectedFile(null);
      // setImagePreview('');
    } finally {
      setIsUploading(false);
    }
  };

  const categories = ['Sedan', 'Electric', 'SUV', 'Truck', 'Hybrid', 'Convertible', 'Luxury'];

  if (isFetching) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading vehicle data...</div>;
  }

  if (!vehicleIdToEdit) {
     // This case should ideally be handled by parent component not rendering EditVehiclePage
    return <div style={{ padding: '20px', color: 'orange', textAlign: 'center' }}>No vehicle selected for editing.</div>;
  }

  if (error && !originalVehicle) { // If error occurred and we have no data to show
    return (
      <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>
        <p>Error: {error}</p>
        {onCancel && <button type="button" onClick={onCancel} style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Back</button>}
      </div>
    );
  }


  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', margin: '20px auto', maxWidth: '600px', backgroundColor: 'white' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Edit Vehicle (ID: {vehicleIdToEdit})</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="edit-make" style={{ display: 'block', marginBottom: '5px' }}>Make:</label>
          <input type="text" id="edit-make" name="make" value={vehicle.make} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="edit-model" style={{ display: 'block', marginBottom: '5px' }}>Model:</label>
          <input type="text" id="edit-model" name="model" value={vehicle.model} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label htmlFor="edit-year" style={{ display: 'block', marginBottom: '5px' }}>Year:</label>
          <input type="number" id="edit-year" name="year" value={vehicle.year} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label htmlFor="edit-basePrice" style={{ display: 'block', marginBottom: '5px' }}>Base Price:</label>
          <input type="number" id="edit-basePrice" name="basePrice" value={vehicle.basePrice} onChange={handleChange} required min="0.01" step="0.01" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label htmlFor="edit-category" style={{ display: 'block', marginBottom: '5px' }}>Category:</label>
          <select id="edit-category" name="category" value={vehicle.category} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="edit-inventory" style={{ display: 'block', marginBottom: '5px' }}>Inventory:</label>
          <input type="number" id="edit-inventory" name="inventory" value={vehicle.inventory} onChange={handleChange} required min="0" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label htmlFor="edit-demand" style={{ display: 'block', marginBottom: '5px' }}>Demand (%):</label>
          <input type="number" id="edit-demand" name="demand" value={vehicle.demand} onChange={handleChange} required min="0" max="100" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label htmlFor="edit-location" style={{ display: 'block', marginBottom: '5px' }}>Location:</label>
          <input type="text" id="edit-location" name="location" value={vehicle.location} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="edit-vehicleImage" style={{ display: 'block', marginBottom: '5px' }}>Vehicle Image:</label>
          {vehicle.imageUrl && !imagePreview && (
            <div style={{ marginBottom: '10px' }}>
              <p style={{ fontSize: '0.9em', fontStyle: 'italic' }}>Current Image:</p>
              <img src={`http://localhost:5000${vehicle.imageUrl}`} alt="Current Vehicle" style={{ maxWidth: '200px', height: 'auto', display: 'block', marginBottom: '10px', border: '1px solid #ddd' }} />
            </div>
          )}
          {imagePreview && (
            <div style={{ marginBottom: '10px' }}>
              <p style={{ fontSize: '0.9em', fontStyle: 'italic' }}>New Image Preview:</p>
              <img src={imagePreview} alt="New Preview" style={{ maxWidth: '200px', height: 'auto', display: 'block', marginBottom: '10px', border: '1px solid #ddd' }} />
            </div>
          )}
          <input type="file" id="edit-vehicleImage" name="vehicleImage" onChange={handleFileChange} accept="image/*" style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} disabled={isUploading || isFetching} />
          {isUploading && <p style={{ margin: '5px 0 0 0', fontStyle: 'italic' }}>Uploading image...</p>}
          {imageUploadError && <p style={{ color: 'red', margin: '5px 0 0 0' }}>{imageUploadError}</p>}
        </div>

        {error && !isFetching && <p style={{ color: 'red', gridColumn: '1 / -1', textAlign: 'center' }}>{error}</p>}

        <div style={{ marginTop: '20px', gridColumn: '1 / -1', textAlign: 'right' }}>
          <button type="submit" disabled={isLoading || isFetching || isUploading} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {isLoading ? 'Updating...' : 'Update Vehicle'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} style={{ marginLeft: '10px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={isLoading || isFetching || isUploading}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EditVehiclePage;
