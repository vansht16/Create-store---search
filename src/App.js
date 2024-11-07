import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import SearchClinic from './components/SearchClinic'; // Import the SearchClinic component

const App = () => {
  const [activeTab, setActiveTab] = useState('addClinic'); // State to manage the active tab
  const [clinic, setClinic] = useState({
    clinicName: '',
    clinicId: '',
    email: '',
    phone: '',
    unitNo: '',
    streetNo: '',
    streetName: '',
    suburb: '',
    postcode: '',
    state: ''
  });
  const [clinics, setClinics] = useState([]);
  const [showManualAddress, setShowManualAddress] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isAddressSelected, setIsAddressSelected] = useState(false);
  const mapContainerRef = useRef(null);
  const autocompleteInputRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [editingClinicId, setEditingClinicId] = useState(null);

  useEffect(() => {
    if (activeTab === 'addClinic') {
      initMap();
      fetchClinics();
    }
  }, [activeTab]);

  const initMap = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const mapInstance = new google.maps.Map(mapContainerRef.current, {
            center: userLocation,
            zoom: 12,
          });

          const userMarker = new google.maps.Marker({
            position: userLocation,
            map: mapInstance,
            title: 'Your Location',
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          });

          setMap(mapInstance);
          setMarker(userMarker);
        },
        () => {
          const defaultLocation = { lat: -33.8688, lng: 151.2093 };
          const mapInstance = new google.maps.Map(mapContainerRef.current, {
            center: defaultLocation,
            zoom: 10,
          });
          setMap(mapInstance);
        }
      );
    } else {
      const defaultLocation = { lat: -33.8688, lng: 151.2093 };
      const mapInstance = new google.maps.Map(mapContainerRef.current, {
        center: defaultLocation,
        zoom: 10,
      });
      setMap(mapInstance);
    }
  };

  useEffect(() => {
    if (map && activeTab === 'addClinic') {
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

        setClinic(prev => ({
          ...prev,
          ...addressComponents,
          address: `${addressComponents.unitNo}, ${addressComponents.streetNo} ${addressComponents.streetName}, ${addressComponents.suburb}, ${addressComponents.postcode}, ${addressComponents.state}`
        }));
        setIsAddressSelected(true);

        const location = place.geometry.location;
        map.setCenter(location);
        marker.setPosition(location);
      });
    }
  }, [map, marker, activeTab]);

  const fetchClinics = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/clinics');
      setClinics(response.data);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClinic((prevClinic) => ({ ...prevClinic, [name]: value }));
    if (name === 'address') setIsAddressSelected(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isAddressSelected) {
      e.preventDefault();
    }
  };

  const saveClinic = async () => {
    try {
      if (editingClinicId) {
        await axios.put(`http://localhost:3000/api/clinics/${editingClinicId}`, clinic);
        setConfirmationMessage('Clinic updated successfully!');
      } else {
        await axios.post('http://localhost:3000/api/clinics', clinic);
        setConfirmationMessage('Clinic saved successfully!');
      }

      setTimeout(() => setConfirmationMessage(''), 3000);
      fetchClinics();
      clearForm();
    } catch (error) {
      console.error('Error saving clinic:', error);
    }
  };

  const clearForm = () => {
    setClinic({
      clinicName: '',
      clinicId: '',
      email: '',
      phone: '',
      unitNo: '',
      streetNo: '',
      streetName: '',
      suburb: '',
      postcode: '',
      state: ''
    });
    setEditingClinicId(null);
  };

  return (
    <div className="app-container">
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'addClinic' ? 'active' : ''}`}
          onClick={() => setActiveTab('addClinic')}
        >
          Add Clinic
        </button>
        <button
          className={`tab-button ${activeTab === 'searchClinic' ? 'active' : ''}`}
          onClick={() => setActiveTab('searchClinic')}
        >
          Search Clinic
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'addClinic' ? (
          <div className="manage-addresses-container">
            <h1>Manage Clinics</h1>
            <p>Your clinic settings and details. All fields are mandatory (*), unless marked Optional.</p>

            <div className="address-card-container">
              <div className="address-card">
                <h2>{editingClinicId ? 'Edit Clinic' : 'Add new clinic'}</h2>
                <form onSubmit={(e) => { e.preventDefault(); saveClinic(); }}>
                  <div className="form-group">
                    <label htmlFor="clinicName">Clinic Name *</label>
                    <input type="text" id="clinicName" name="clinicName" value={clinic.clinicName} onChange={handleChange} required placeholder="Clinic Name" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="clinicId">Clinic ID *</label>
                    <input type="text" id="clinicId" name="clinicId" value={clinic.clinicId} onChange={handleChange} required placeholder="Clinic ID" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input type="email" id="email" name="email" value={clinic.email} onChange={handleChange} required placeholder="Email" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone *</label>
                    <input type="tel" id="phone" name="phone" value={clinic.phone} onChange={handleChange} required placeholder="Phone" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address *</label>
                    <input
                      type="text"
                      ref={autocompleteInputRef}
                      id="address"
                      name="address"
                      value={clinic.address}
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
                        <input type="text" id="unitNo" name="unitNo" value={clinic.unitNo} onChange={handleChange} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="streetNo">Street No *</label>
                        <input type="text" id="streetNo" name="streetNo" value={clinic.streetNo} onChange={handleChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="streetName">Street Name *</label>
                        <input type="text" id="streetName" name="streetName" value={clinic.streetName} onChange={handleChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="suburb">Suburb *</label>
                        <input type="text" id="suburb" name="suburb" value={clinic.suburb} onChange={handleChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="postcode">Postcode *</label>
                        <input type="text" id="postcode" name="postcode" value={clinic.postcode} onChange={handleChange} required />
                      </div>
                      <div className="form-group">
                        <label htmlFor="state">State *</label>
                        <input type="text" id="state" name="state" value={clinic.state} onChange={handleChange} required />
                      </div>
                    </div>
                  )}

                  <button type="submit" className="add-btn">{editingClinicId ? 'Update Clinic' : 'Save Clinic'}</button>
                </form>
                {confirmationMessage && <p className="confirmation-msg">{confirmationMessage}</p>}
              </div>

              {/* Map Display */}
              <div ref={mapContainerRef} className="map-container"></div>
            </div>

            {/* List of Clinics */}
            <div className="clinic-list">
              <h2>Saved Clinics</h2>
              <div className="clinic-list-container">
                {clinics.map(clinic => (
                  <div key={clinic._id} className="clinic-card">
                    <p><strong>{clinic.clinicName}</strong></p>
                    <p>{clinic.address}</p>
                    <button onClick={() => selectClinic(clinic)} className="edit-btn">Edit</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <SearchClinic />
        )}
      </div>
    </div>
  );
};

export default App;
