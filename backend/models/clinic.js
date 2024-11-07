const mongoose = require('mongoose');

const ClinicSchema = new mongoose.Schema({
  clinicName: { type: String, required: true },
  clinicId: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  unitNo: { type: String },    
  streetNo: { type: String }, 
  streetName: { type: String }, 
  suburb: { type: String },
  state: { type: String },
  postcode: { type: String },
  latitude: { type: Number }, 
  longitude: { type: Number } 
});

module.exports = mongoose.model('Clinic', ClinicSchema);
