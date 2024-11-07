import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './SearchClinic.css';

const SearchClinic = () => {
  const [clinics, setClinics] = useState([]);
  const [searchLocation, setSearchLocation] = useState('');
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [clinicMarkers, setClinicMarkers] = useState([]);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const initMap = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            const mapInstance = new google.maps.Map(mapRef.current, {
              center: userLocation,
              zoom: 12,
            });

            new google.maps.Marker({
              position: userLocation,
              map: mapInstance,
              title: 'Your Location',
              icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            });

            setMap(mapInstance);
          },
          () => {
            const defaultLocation = { lat: -33.8688, lng: 151.2093 };
            const mapInstance = new google.maps.Map(mapRef.current, {
              center: defaultLocation,
              zoom: 10,
            });
            setMap(mapInstance);
          }
        );
      } else {
        const defaultLocation = { lat: -33.8688, lng: 151.2093 };
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: defaultLocation,
          zoom: 10,
        });
        setMap(mapInstance);
      }
    };

    initMap();
    fetchClinics();
  }, []);

  useEffect(() => {
    if (map && clinics.length > 0) {
      addClinicMarkers();
    }
  }, [map, clinics]);

  useEffect(() => {
    if (window.google) {
      const autocomplete = new google.maps.places.Autocomplete(
        autocompleteRef.current,
        {
          types: ['geocode'],
          componentRestrictions: { country: 'au' },
        }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && map) {
          handlePlaceSelected(place.geometry.location);
        }
      });
    }
  }, [map]);

  const fetchClinics = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/clinics');
      setClinics(response.data);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  const addClinicMarkers = () => {
    const geocoder = new google.maps.Geocoder();
    clinicMarkers.forEach(marker => marker.setMap(null));
    const newMarkers = [];

    clinics.forEach(clinic => {
      if (clinic.address) {
        geocoder.geocode({ address: clinic.address }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
            const clinicLocation = results[0].geometry.location;
            const marker = new google.maps.Marker({
              position: clinicLocation,
              map,
              title: clinic.clinicName,
            });

            const infowindowContent = `
              <div>
                <strong>${clinic.clinicName}</strong><br>
                Email: ${clinic.email}<br>
                Phone: ${clinic.phone}<br>
                Address: ${clinic.unitNo ? 'Unit ' + clinic.unitNo + ', ' : ''}${clinic.streetNo} ${clinic.streetName}, ${clinic.suburb}, ${clinic.postcode}, ${clinic.state}
              </div>
            `;

            const infowindow = new google.maps.InfoWindow({
              content: infowindowContent,
            });

            marker.addListener('click', () => {
              infowindow.open(map, marker);
            });

            newMarkers.push({ marker, clinicLocation });
          } else {
            console.error('Geocode was not successful for the following reason:', status);
          }
        });
      }
    });

    setClinicMarkers(newMarkers);
  };

  const handlePlaceSelected = (location) => {
    if (map) {
      map.setCenter(location);
      map.setZoom(14);
    } else {
      console.error("Map instance is not initialized.");
    }
  };

  const handleClinicClick = (clinic) => {
    const clinicMarker = clinicMarkers.find(
      (item) => item.marker.getTitle() === clinic.clinicName
    );

    if (clinicMarker && clinicMarker.clinicLocation) {
      map.setCenter(clinicMarker.clinicLocation);
      map.setZoom(16);
    } else {
      console.error("Clinic marker not found for:", clinic.clinicName);
    }
  };

  return (
    <div className="search-clinic-container">
      <h2>Search Clinics</h2>
      <div className="search-bar">
        <input
          ref={autocompleteRef}
          type="text"
          placeholder="Enter location to search clinics"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
        />
      </div>
      <div className="content">
        <div className="clinic-list">
          {clinics.map((clinic) => (
            <div
              key={clinic._id}
              className="clinic-card"
              onClick={() => handleClinicClick(clinic)}
            >
              <p><strong>{clinic.clinicName}</strong></p>
              <p>Phone: {clinic.phone}</p>
              <p>{clinic.address}</p>
            </div>
          ))}
        </div>
        <div ref={mapRef} className="map-container"></div>
      </div>
    </div>
  );
};

export default SearchClinic;
