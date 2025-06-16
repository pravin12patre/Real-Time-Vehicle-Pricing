// src/VehicleFilter.js
import React, { useState, useEffect } from 'react';

const VehicleFilter = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    sortBy: 'createdAt', // Default sort
    sortOrder: 'desc',   // Default order
    ...initialFilters // Spread any initial filters from props
  });

  // Update local state if initialFilters prop changes (e.g., from parent resetting them)
  useEffect(() => {
    // Only update if initialFilters is actually different to avoid infinite loops if parent isn't careful
    if (JSON.stringify(initialFilters) !== JSON.stringify(filters)) {
        setFilters(prev => ({ ...prev, ...initialFilters }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilters]); // Dependency on initialFilters (stringified or deep compare if complex)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    // Prepare filters for submission:
    // Numeric fields are already handled as strings or numbers by input type.
    // apiService's GET request now filters out empty/null/undefined params.
    onFilterChange(filters);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      keyword: '', category: '', minPrice: '', maxPrice: '',
      minYear: '', maxYear: '', sortBy: 'createdAt', sortOrder: 'desc'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters); // Notify parent to re-fetch with default/no filters
  };

  // Example categories - in a real app, this might come from API or config
  // Added an empty string to categories array to ensure "All Categories" option works if user re-selects it.
  const categories = ['', 'Sedan', 'Electric', 'SUV', 'Truck', 'Hybrid', 'Convertible', 'Luxury'];
  const sortOptions = [
    { value: 'createdAt', label: 'Date Added' },
    { value: 'basePrice', label: 'Price' },
    { value: 'year', label: 'Year' },
    { value: 'make', label: 'Make' },
    // { value: 'model', label: 'Model' }, // Model sorting might be less common, can be added if needed
  ];

  // Basic inline styles for layout - replace with Tailwind or CSS classes as needed
  const formStyle = {
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '20px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  };
  const filterGroupStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', // Responsive grid
    gap: '15px',
    marginBottom: '15px',
  };
  const inputContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
  };
  const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '1em' };
  const labelStyle = { marginBottom: '5px', fontWeight: '500', fontSize: '0.9em' }; // Added label style

  return (
    <form onSubmit={handleApplyFilters} style={formStyle}>
      <h4 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Filter & Sort Vehicles</h4>
      <div style={filterGroupStyle}>
        <div style={inputContainerStyle}>
          <label htmlFor="keyword" style={labelStyle}>Keyword:</label>
          <input
            type="text"
            id="keyword"
            name="keyword"
            placeholder="Make, Model"
            value={filters.keyword}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div style={inputContainerStyle}>
          <label htmlFor="category" style={labelStyle}>Category:</label>
          <select id="category" name="category" value={filters.category} onChange={handleChange} style={inputStyle}>
            {categories.map(cat => <option key={cat} value={cat}>{cat === '' ? 'All Categories' : cat}</option>)}
          </select>
        </div>
      </div>
      <div style={filterGroupStyle}>
        <div style={inputContainerStyle}>
          <label htmlFor="minPrice" style={labelStyle}>Min Price:</label>
          <input type="number" id="minPrice" name="minPrice" placeholder="e.g., 10000" value={filters.minPrice} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={inputContainerStyle}>
          <label htmlFor="maxPrice" style={labelStyle}>Max Price:</label>
          <input type="number" id="maxPrice" name="maxPrice" placeholder="e.g., 50000" value={filters.maxPrice} onChange={handleChange} style={inputStyle} />
        </div>
      </div>
      <div style={filterGroupStyle}>
        <div style={inputContainerStyle}>
          <label htmlFor="minYear" style={labelStyle}>Min Year:</label>
          <input type="number" id="minYear" name="minYear" placeholder="e.g., 2018" value={filters.minYear} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={inputContainerStyle}>
          <label htmlFor="maxYear" style={labelStyle}>Max Year:</label>
          <input type="number" id="maxYear" name="maxYear" placeholder="e.g., 2024" value={filters.maxYear} onChange={handleChange} style={inputStyle} />
        </div>
      </div>
      <div style={filterGroupStyle}>
        <div style={inputContainerStyle}>
          <label htmlFor="sortBy" style={labelStyle}>Sort By:</label>
          <select id="sortBy" name="sortBy" value={filters.sortBy} onChange={handleChange} style={inputStyle}>
            {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div style={inputContainerStyle}>
          <label htmlFor="sortOrder" style={labelStyle}>Order:</label>
          <select id="sortOrder" name="sortOrder" value={filters.sortOrder} onChange={handleChange} style={inputStyle}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button type="submit" style={{ ...inputStyle, backgroundColor: '#007bff', color: 'white', cursor: 'pointer', flex: '1' }}>Apply Filters</button>
        <button type="button" onClick={handleResetFilters} style={{ ...inputStyle, backgroundColor: '#6c757d', color: 'white', cursor: 'pointer', flex: '1' }}>Reset Filters</button>
      </div>
    </form>
  );
};

export default VehicleFilter;
