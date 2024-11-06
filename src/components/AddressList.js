import React from 'react';

const AddressList = ({ addresses }) => (
  <div className="address-card">
    <h2>Your Addresses</h2>
    {addresses.map((address, index) => (
      <div key={index} className="saved-address">
        <p><strong>{address.storeName}</strong></p>
        <p>Store ID: {address.storeId}</p>
        <p>Email: {address.email}</p>
        <p>Phone: {address.phone}</p>
        <p>
          {address.unitNo ? `Unit ${address.unitNo}, ` : ''}
          {address.streetNo} {address.streetName}, {address.suburb}, {address.postcode}, {address.state}
        </p>
      </div>
    ))}
  </div>
);

export default AddressList;
