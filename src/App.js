import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [profile, setProfile] = useState({
    storeName: '',
    storeId: '',
    email: '',
    phone: '',
    unitNo: '',
    streetNo: '',
    streetName: '',
    suburb: '',
    postcode: '',
    state: ''
  });
  const [stores, setStores] = useState([]);
  const [showManualAddress, setShowManualAddress] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isAddressSelected, setIsAddressSelected] = useState(false);
  const mapContainerRef = useRef(null);
  const autocompleteInputRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [editingStoreId, setEditingStoreId] = useState(null);

  useEffect(() => {
    const initMap = () => {
      const defaultLocation = { lat: -33.8688, lng: 151.2093 }; // Default location
      const map = new google.maps.Map(mapContainerRef.current, {
        center: defaultLocation,
        zoom: 15,
      });
      const marker = new google.maps.Marker({
        position: defaultLocation,
        map: map,
        title: 'Store Location',
      });
      setMap(map);
      setMarker(marker);
    };

    initMap();
    fetchStores(); // Fetch all stores on initial load
  }, []);

  useEffect(() => {
    const autocomplete = new google.maps.places.Autocomplete(autocompleteInputRef.current, {
      types: ['address'],
      componentRestrictions: { country: "au" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      const addressComponents = {
        unitNo: '',
        streetNo: '',
        streetName: '',
        suburb: '',
        postcode: '',
        state: ''
      };

      place.address_components.forEach(component => {
        const types = component.types;
        if (types.includes("subpremise")) {
          addressComponents.unitNo = component.long_name;
        } else if (types.includes("street_number")) {
          addressComponents.streetNo = component.long_name;
        } else if (types.includes("route")) {
          addressComponents.streetName = component.long_name;
        } else if (types.includes("locality")) {
          addressComponents.suburb = component.long_name;
        } else if (types.includes("postal_code")) {
          addressComponents.postcode = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          addressComponents.state = component.short_name;
        }
      });

      setProfile(prev => ({
        ...prev,
        ...addressComponents,
        address: `${addressComponents.unitNo}, ${addressComponents.streetNo} ${addressComponents.streetName}, ${addressComponents.suburb}, ${addressComponents.postcode}, ${addressComponents.state}`
      }));
      setIsAddressSelected(true);

      // Center map on selected location
      const location = place.geometry.location;
      map.setCenter(location);
      marker.setPosition(location);
    });
  }, [map, marker]);

  const fetchStores = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/profiles');
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
    if (name === 'address') setIsAddressSelected(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isAddressSelected) {
      e.preventDefault();
    }
  };

  const saveProfile = async () => {
    try {
      if (editingStoreId) {
        await axios.put(`http://localhost:3000/api/profiles/${editingStoreId}`, profile);
        setConfirmationMessage('Store updated successfully!');
      } else {
        await axios.post('http://localhost:3000/api/profiles', profile);
        setConfirmationMessage('Store saved successfully!');
      }

      setTimeout(() => setConfirmationMessage(''), 3000);
      fetchStores();
      clearForm();
    } catch (error) {
      console.error('Error saving store:', error);
    }
  };

  const clearForm = () => {
    setProfile({
      storeName: '',
      storeId: '',
      email: '',
      phone: '',
      unitNo: '',
      streetNo: '',
      streetName: '',
      suburb: '',
      postcode: '',
      state: ''
    });
    setEditingStoreId(null);
  };

  const selectStore = (store) => {
    setProfile(store);
    setEditingStoreId(store._id);
    showAddressOnMap(store.address);
  };

  const showAddressOnMap = (address) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        marker.setPosition(location);
      } else {
        console.error('Geocode was not successful for the following reason:', status);
      }
    });
  };

  return (
    <div className="manage-addresses-container">
      <h1>Manage Addresses</h1>
      <p>Your profile settings and details. All fields are mandatory (*), unless marked Optional.</p>

      <div className="address-card-container">
        <div className="address-card">
          <h2>{editingStoreId ? 'Edit Address' : 'Add new address'}</h2>
          <form onSubmit={(e) => { e.preventDefault(); saveProfile(); }}>
            <div className="form-group">
              <label htmlFor="storeName">Store Name *</label>
              <input type="text" id="storeName" name="storeName" value={profile.storeName} onChange={handleChange} required placeholder="Store Name" />
            </div>

            <div className="form-group">
              <label htmlFor="storeId">Store ID *</label>
              <input type="text" id="storeId" name="storeId" value={profile.storeId} onChange={handleChange} required placeholder="Store ID" />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input type="email" id="email" name="email" value={profile.email} onChange={handleChange} required placeholder="Email" />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone *</label>
              <input type="tel" id="phone" name="phone" value={profile.phone} onChange={handleChange} required placeholder="Phone" />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                ref={autocompleteInputRef}
                id="address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                required
                placeholder="Start typing your address"
              />
            </div>

            <div className="manual-entry-toggle">
              <a href="#" onClick={(e) => { e.preventDefault(); setShowManualAddress((prev) => !prev); }}>Address not listed? Add manually</a>
            </div>

            {showManualAddress && (
              <div>
                <div className="form-group">
                  <label htmlFor="unitNo">Unit No</label>
                  <input type="text" id="unitNo" name="unitNo" value={profile.unitNo} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="streetNo">Street No *</label>
                  <input type="text" id="streetNo" name="streetNo" value={profile.streetNo} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="streetName">Street Name *</label>
                  <input type="text" id="streetName" name="streetName" value={profile.streetName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="suburb">Suburb *</label>
                  <input type="text" id="suburb" name="suburb" value={profile.suburb} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="postcode">Postcode *</label>
                  <input type="text" id="postcode" name="postcode" value={profile.postcode} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input type="text" id="state" name="state" value={profile.state} onChange={handleChange} required />
                </div>
              </div>
            )}

            <button type="submit" className="add-btn">{editingStoreId ? 'Update Address' : 'Save Address'}</button>
          </form>
          {confirmationMessage && <p className="confirmation-msg">{confirmationMessage}</p>}
        </div>

        {/* Map Display */}
        <div ref={mapContainerRef} className="map-container"></div>
      </div>

      {/* List of Stores */}
      <div className="store-list">
        <h2>Saved Stores</h2>
        <div className="store-list-container">
          {stores.map(store => (
            <div key={store._id} className="store-card">
              <p><strong>{store.storeName}</strong></p>
              <p>{store.address}</p>
              <button onClick={() => selectStore(store)} className="edit-btn">Edit</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
