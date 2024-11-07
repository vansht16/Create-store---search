import React from 'react';

const ClinicList = ({ clinics }) => (
  <div className="clinic-card">
    <h2>Your Clinics</h2>
    {clinics.map((clinic, index) => (
      <div key={index} className="saved-clinic">
        <p><strong>{clinic.clinicName}</strong></p>
        <p>Clinic ID: {clinic.clinicId}</p>
        <p>Email: {clinic.email}</p>
        <p>Phone: {clinic.phone}</p>
        <p>
          {clinic.unitNo ? `Unit ${clinic.unitNo}, ` : ''}
          {clinic.streetNo} {clinic.streetName}, {clinic.suburb}, {clinic.postcode}, {clinic.state}
        </p>
      </div>
    ))}
  </div>
);

export default ClinicList;
