const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const Hospital = require('../models/Hospital');
const Donor = require('../models/Donor');
const BloodRequest = require('../models/BloodRequest');

// Get all donors with detailed information
router.get('/donors', adminAuth, async (req, res) => {
    try {
        const donors = await Donor.find({}, { password: 0 })
            .select('name email bloodGroup age gender city state phone lastDonation donations createdAt')
            .sort({ createdAt: -1 });
        
        console.log(`Found ${donors.length} donors`);
        res.json(donors);
    } catch (err) {
        console.error('Error fetching donors:', err);
        res.status(500).json({ message: 'Error fetching donors', error: err.message });
    }
});

// Get all hospitals with detailed information
router.get('/hospitals', adminAuth, async (req, res) => {
    try {
        const hospitals = await Hospital.find({}, { password: 0 })
            .select('name email licenseNumber phone city state contactPerson isVerified requestsMade requestsCompleted createdAt')
            .sort({ createdAt: -1 });
        
        console.log(`Found ${hospitals.length} hospitals`);
        res.json(hospitals);
    } catch (err) {
        console.error('Error fetching hospitals:', err);
        res.status(500).json({ message: 'Error fetching hospitals', error: err.message });
    }
});

// Get a single hospital by ID
router.get('/hospitals/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate hospital ID
        if (!id) {
            return res.status(400).json({ message: 'Hospital ID is required' });
        }
        
        const hospital = await Hospital.findById(id, { password: 0 })
            .select('name email licenseNumber phone city state contactPerson isVerified requestsMade requestsCompleted createdAt');
        
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        
        console.log(`Found hospital: ${hospital.name}`);
        res.json(hospital);
    } catch (err) {
        console.error('Error fetching hospital details:', err);
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid hospital ID format' });
        }
        res.status(500).json({ message: 'Error fetching hospital details', error: err.message });
    }
});

// Get unverified hospitals
router.get('/unverified-hospitals', adminAuth, async (req, res) => {
    try {
        const hospitals = await Hospital.find({ isVerified: false }, { password: 0 })
            .select('name email licenseNumber phone city state contactPerson createdAt')
            .sort({ createdAt: -1 });
        
        console.log(`Found ${hospitals.length} unverified hospitals`);
        res.json(hospitals);
    } catch (err) {
        console.error('Error fetching unverified hospitals:', err);
        res.status(500).json({ message: 'Error fetching unverified hospitals', error: err.message });
    }
});

// Verify/unverify a hospital
router.post('/verify-hospital/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;

        // Validate hospital ID
        if (!id) {
            return res.status(400).json({ message: 'Hospital ID is required' });
        }

        console.log('Verifying hospital:', { id, isVerified });

        const hospital = await Hospital.findById(id);
        
        if (!hospital) {
            console.log('Hospital not found:', id);
            return res.status(404).json({ message: 'Hospital not found' });
        }

        hospital.isVerified = isVerified;
        await hospital.save();
        
        console.log(`Hospital ${hospital._id} verification status updated to: ${isVerified}`);
        res.json({ 
            message: `Hospital ${isVerified ? 'verified' : 'unverified'} successfully`,
            hospital: {
                _id: hospital._id,
                name: hospital.name,
                email: hospital.email,
                isVerified: hospital.isVerified
            }
        });
    } catch (err) {
        console.error('Error updating hospital verification status:', err);
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid hospital ID format' });
        }
        res.status(500).json({ message: 'Error updating hospital verification status', error: err.message });
    }
});

// Add a test route
router.get('/test', (req, res) => {
    console.log('Admin test route hit');
    res.json({ message: 'Admin API is working!' });
});

module.exports = router;