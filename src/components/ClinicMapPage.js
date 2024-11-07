// ClinicMapPage.js
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const ClinicMapPage = () => {
  const mapRef = useRef(null);
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const searchInputRef = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    // Initialize the map
    const initMap = () => {
      const defaultLocation = { lat: -33.8688, lng: 151.2093 }; // Default center location
      const map = new google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 12,
      });
      setMap(map);
    };

    initMap();
    fetchClinics(); // Fetch clinics on load
  }, []);

  useEffect(() => {
    if (map && clinics.length > 0) {
      clinics.forEach(clinic => {
        const marker = new google.maps.Marker({
          position: {
            lat: parseFloat(clinic.latitude), // Assuming latitude is stored in DB
            lng: parseFloat(clinic.longitude), // Assuming longitude is stored in DB
          },
          map: map,
          title: clinic.storeName,
        });

        marker.addListener('click', () => {
          setSelectedClinic(clinic);
        });
      });
    }
  }, [map, clinics]);

  useEffect(() => {
    if (map) {
      const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['geocode'],
        componentRestrictions: { country: "au" },
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const location = place.geometry.location;

        // Center map on search location
        map.setCenter(location);
        map.setZoom(14);

        setSearchLocation({
          lat: location.lat(),
          lng: location.lng(),
        });
      });
    }
  }, [map]);

  const fetchClinics = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/profiles');
      setClinics(response.data);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Find a Clinic</h2>
      <input
        type="text"
        ref={searchInputRef}
        placeholder="Search for a location..."
        style={{ width: '300px', marginBottom: '20px', padding: '8px' }}
      />
      <div ref={mapRef} style={{ width: '100%', height: '500px' }} />

      {searchLocation && (
        <google.maps.Marker
          position={searchLocation}
          map={map}
          icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
        />
      )}

      {selectedClinic && (
        <div className="clinic-popup">
          <h3>{selectedClinic.storeName}</h3>
          <p><strong>Phone:</strong> {selectedClinic.phone}</p>
          <p><strong>Address:</strong> {selectedClinic.unitNo ? `${selectedClinic.unitNo}, ` : ''}{selectedClinic.streetNo} {selectedClinic.streetName}, {selectedClinic.suburb}, {selectedClinic.postcode}, {selectedClinic.state}</p>
          <button onClick={() => setSelectedClinic(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default ClinicMapPage;
