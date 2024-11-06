const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  storeId: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  unitNo: { type: String },    
  streetNo: { type: String }, 
  streetName: { type: String }, 
  suburb: { type: String },
  state: { type: String },
  postcode: { type: String }
});

module.exports = mongoose.model('Profile', ProfileSchema);
