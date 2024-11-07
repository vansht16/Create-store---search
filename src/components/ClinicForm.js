import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ClinicForm = ({ onClinicAdded, onClinicChange }) => {
  const [clinic, setClinic] = useState({
    clinicName: '',
    clinicId: '',
    email: '',
    phone: '',
    address: '',
    unitNo: '',
    streetNo: '',
    streetName: '',
    suburb: '',
    state: '',
    postcode: ''
  });
  const [showManualAddress, setShowManualAddress] = useState(false);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (window.google && window.google.maps) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteRef.current,
        { types: ['address'] }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.address_components) {
          handleAddressSelect(place);
        }
      });
    }
  }, []);

  const handleAddressSelect = (place) => {
    const address = place.formatted_address;
    const components = place.address_components;
    const clinicUpdate = { address };

    components.forEach(component => {
      const types = component.types;
      if (types.includes("subpremise")) {
        clinicUpdate.unitNo = component.long_name;
      } else if (types.includes("street_number")) {
        clinicUpdate.streetNo = component.long_name;
      } else if (types.includes("route")) {
        clinicUpdate.streetName = component.long_name;
      } else if (types.includes("locality")) {
        clinicUpdate.suburb = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        clinicUpdate.state = component.short_name;
      } else if (types.includes("postal_code")) {
        clinicUpdate.postcode = component.long_name;
      }
    });

    setClinic(prevState => ({ ...prevState, ...clinicUpdate }));
    onClinicChange(address);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClinic({ ...clinic, [name]: value });

    if (name === 'address') {
      onClinicChange(value);
    }
  };

  const toggleManualEntry = (e) => {
    e.preventDefault();
    setShowManualAddress(!showManualAddress);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/clinics', clinic); // Backend API URL here
      onClinicAdded();
      setClinic({
        clinicName: '',
        clinicId: '',
        email: '',
        phone: '',
        address: '',
        unitNo: '',
        streetNo: '',
        streetName: '',
        suburb: '',
        state: '',
        postcode: ''
      });
    } catch (error) {
      console.error('Error saving clinic:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Clinic Name *</label>
        <input name="clinicName" value={clinic.clinicName} onChange={handleInputChange} required />
      </div>
      <div className="form-group">
        <label>Clinic ID *</label>
        <input name="clinicId" value={clinic.clinicId} onChange={handleInputChange} required />
      </div>
      <div className="form-group">
        <label>Email *</label>
        <input name="email" type="email" value={clinic.email} onChange={handleInputChange} required />
      </div>
      <div className="form-group">
        <label>Phone *</label>
        <input name="phone" type="tel" value={clinic.phone} onChange={handleInputChange} required />
      </div>
      <div className="form-group">
        <label>Address *</label>
        <input
          name="address"
          value={clinic.address}
          onChange={handleInputChange}
          ref={autocompleteRef}
          placeholder="Start typing your address"
          required
        />
      </div>
      <div className="manual-entry-toggle">
        <a href="#" onClick={toggleManualEntry}>Address not listed? Add manually</a>
      </div>

      {showManualAddress && (
        <div>
          <div className="form-group">
            <label>Unit No</label>
            <input name="unitNo" value={clinic.unitNo} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Street No *</label>
            <input name="streetNo" value={clinic.streetNo} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Street Name *</label>
            <input name="streetName" value={clinic.streetName} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Suburb *</label>
            <input name="suburb" value={clinic.suburb} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>State *</label>
            <input name="state" value={clinic.state} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Postcode *</label>
            <input name="postcode" value={clinic.postcode} onChange={handleInputChange} required />
          </div>
        </div>
      )}

      <button type="submit" className="add-btn">Add New Clinic</button>
    </form>
  );
};

export default ClinicForm;
