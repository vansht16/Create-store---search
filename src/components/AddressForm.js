import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const AddressForm = ({ onAddressAdded, onAddressChange }) => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
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
    const profileUpdate = { address };

    components.forEach(component => {
      const types = component.types;
      if (types.includes("subpremise")) {
        profileUpdate.unitNo = component.long_name;
      } else if (types.includes("street_number")) {
        profileUpdate.streetNo = component.long_name;
      } else if (types.includes("route")) {
        profileUpdate.streetName = component.long_name;
      } else if (types.includes("locality")) {
        profileUpdate.suburb = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        profileUpdate.state = component.short_name;
      } else if (types.includes("postal_code")) {
        profileUpdate.postcode = component.long_name;
      }
    });

    setProfile(prevState => ({ ...prevState, ...profileUpdate }));
    onAddressChange(address);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });

    if (name === 'address') {
      onAddressChange(value);
    }
  };

  const toggleManualEntry = (e) => {
    e.preventDefault();
    setShowManualAddress(!showManualAddress);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/addresses', profile); 
      onAddressAdded();
      setProfile({
        firstName: '',
        lastName: '',
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
      console.error('Error saving profile:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>First name *</label>
        <input name="firstName" value={profile.firstName} onChange={handleInputChange} required />
      </div>
      <div className="form-group">
        <label>Last name *</label>
        <input name="lastName" value={profile.lastName} onChange={handleInputChange} required />
      </div>
      <div className="form-group">
        <label>Phone *</label>
        <input name="phone" value={profile.phone} onChange={handleInputChange} required />
      </div>
      <div className="form-group">
        <label>Address *</label>
        <input
          name="address"
          value={profile.address}
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
            <input name="unitNo" value={profile.unitNo} onChange={handleInputChange} />
          </div>
          <div className="form-group">
            <label>Street No *</label>
            <input name="streetNo" value={profile.streetNo} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Street Name *</label>
            <input name="streetName" value={profile.streetName} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Suburb *</label>
            <input name="suburb" value={profile.suburb} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>State *</label>
            <input name="state" value={profile.state} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Postcode *</label>
            <input name="postcode" value={profile.postcode} onChange={handleInputChange} required />
          </div>
        </div>
      )}

      <button type="submit" className="add-btn">Add New Address</button>
    </form>
  );
};

export default AddressForm;
