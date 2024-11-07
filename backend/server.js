const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const Clinic = require('./models/clinic'); // Use updated 'clinic.js' model

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/clinicDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Could not connect to MongoDB:', error));

// Route to save a new clinic
app.post('/api/clinics', async (req, res) => {
  try {
    const newClinic = new Clinic(req.body);
    await newClinic.save();
    res.status(201).json(newClinic);
  } catch (error) {
    console.error('Error saving clinic:', error);
    res.status(400).json({ message: 'Failed to save clinic' });
  }
});

// Route to retrieve all clinics
app.get('/api/clinics', async (req, res) => {
  try {
    const clinics = await Clinic.find();
    res.json(clinics);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch clinics' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
