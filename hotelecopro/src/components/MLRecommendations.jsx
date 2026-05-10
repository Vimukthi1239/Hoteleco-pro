import React, { useState } from 'react';

const MLRecommendations = () => {
  // States for Recommendation Query
  const [searchType, setSearchType] = useState('hotels'); // 'hotels' or 'sites'
  const [searchName, setSearchName] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // States for Adding New Data
  const [addType, setAddType] = useState('hotel'); // 'hotel' or 'site'
  const [newName, setNewName] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');
  const [addMessage, setAddMessage] = useState('');

  const API_BASE_URL = 'http://localhost:8000';

  // --- 1. Fetch Recommendations ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchName) return;

    setLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      // Choose endpoint based on search type
      const endpoint = searchType === 'hotels'
        ? `/recommend/hotels?site_name=${searchName}&top_k=5`
        : `/recommend/sites?hotel_name=${searchName}&top_k=5`;

      const response = await fetch(`${API_BASE_URL}${endpoint}`);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Data not found!');
      }

      const data = await response.json();

      if (searchType === 'hotels') {
        setRecommendations(data.recommended_hotels);
      } else {
        setRecommendations(data.recommended_sites);
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Add New Data to Train Model ---
  const handleAddData = async (e) => {
    e.preventDefault();
    setAddMessage('');

    if (!newName || !newLat || !newLng) {
      setAddMessage('Please fill all fields');
      return;
    }

    try {
      const endpoint = addType === 'hotel' ? '/add/hotel' : '/add/site';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName,
          latitude: parseFloat(newLat),
          longitude: parseFloat(newLng)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add data');
      }

      const result = await response.json();
      setAddMessage(`Success: ${result.message}`);

      // Clear form
      setNewName('');
      setNewLat('');
      setNewLng('');

    } catch (err) {
      console.error("Error adding data:", err);
      setAddMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>Tourism AI Recommendations</h1>

      {/* Search Section */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Find Recommendations</h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="hotels">Find Hotels near a Destination</option>
            <option value="sites">Find Destinations near a Hotel</option>
          </select>

          <input
            type="text"
            placeholder={searchType === 'hotels' ? "Enter Destination Name (e.g. Sigiriya)" : "Enter Hotel Name"}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />

          <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Results List */}
        {recommendations.length > 0 && (
          <div>
            <h3>Top 5 Recommendations:</h3>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {recommendations.map((item, index) => (
                <li key={index} style={{ background: 'white', padding: '10px', margin: '5px 0', borderRadius: '4px', border: '1px solid #eee' }}>
                  <strong>{item.hotel_name || item.site_name}</strong> - Distance: {item.distance_km} km
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Add Data Section */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>Add New Data (Auto-Trains Model)</h2>
        <form onSubmit={handleAddData} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <select
            value={addType}
            onChange={(e) => setAddType(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="hotel">Add New Hotel</option>
            <option value="site">Add New Destination Site</option>
          </select>

          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              step="any"
              placeholder="Latitude (e.g. 7.957)"
              value={newLat}
              onChange={(e) => setNewLat(e.target.value)}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude (e.g. 80.760)"
              value={newLng}
              onChange={(e) => setNewLng(e.target.value)}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <button type="submit" style={{ padding: '10px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Add & Train Model
          </button>
        </form>

        {addMessage && (
          <p style={{ marginTop: '15px', color: addMessage.includes('Error') ? 'red' : 'green', fontWeight: 'bold' }}>
            {addMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default MLRecommendations;
