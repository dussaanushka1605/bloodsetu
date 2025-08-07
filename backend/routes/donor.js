const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const auth = require('../middleware/auth');
const BloodRequest = require('../models/BloodRequest');
const multer = require('multer');
const path = require('path');
const History = require('../models/History'); // Added missing import for History

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all donors
router.get('/', auth, async (req, res) => {
    try {
        console.log('Getting all donors, user role:', req.user.role);
        const donors = await Donor.find();
        console.log('Found donors:', donors.map(d => ({ id: d._id, name: d.name, email: d.email })));
        res.json(donors);
    } catch (error) {
        console.error('Error getting donors:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get donor profile
router.get('/profile', auth, async (req, res) => {
    try {
        console.log('Getting donor profile for user ID:', req.user.userId);
        const donor = await Donor.findById(req.user.userId);
        if (!donor) {
            console.log('Donor not found with ID:', req.user.userId);
            return res.status(404).json({ message: 'Donor not found' });
        }
        console.log('Donor found:', donor.name, donor.email);
        res.json(donor);
    } catch (error) {
        console.error('Error getting donor profile:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update donor profile
router.patch('/profile', auth, async (req, res) => {
    try {
        const donorId = req.user.userId;
        console.log('Received PATCH request for donor profile');
        console.log('User ID from token:', donorId);
        console.log('Request body:', req.body);
        console.log('Request headers:', req.headers);
        console.log('Content-Type:', req.headers['content-type']);
        
        const updateData = {};

        // Only update fields that are provided in the request
        if (req.body.name !== undefined) updateData.name = req.body.name;
        if (req.body.bloodGroup !== undefined) updateData.bloodGroup = req.body.bloodGroup;
        if (req.body.age !== undefined) updateData.age = parseInt(req.body.age);
        if (req.body.gender !== undefined) updateData.gender = req.body.gender;
        if (req.body.city !== undefined) updateData.city = req.body.city;
        if (req.body.state !== undefined) updateData.state = req.body.state;
        if (req.body.phone !== undefined) updateData.phone = req.body.phone;
        if (req.body.isAvailable !== undefined) updateData.isAvailable = req.body.isAvailable === 'true';

        // Profile picture feature has been removed

        console.log('Updating donor profile with data:', updateData);

        console.log('Searching for donor with ID:', donorId);
        const donor = await Donor.findByIdAndUpdate(
            donorId,
            updateData,
            { new: true, runValidators: true }
        );
            
        if (!donor) {
            console.log('Donor not found with ID:', donorId);
            return res.status(404).json({ message: 'Donor not found' });
        }
        
        console.log('Donor found and updated successfully:', donor._id);

        // Create history record only if there are actual updates
        if (Object.keys(updateData).length > 0) {
            await History.create({
                userId: donor._id,
                userType: 'Donor',
                action: 'update_profile',
                details: { updatedFields: Object.keys(updateData) },
                date: new Date()
            });
        }

        res.json({
            _id: donor._id,
            name: donor.name,
            email: donor.email,
            bloodGroup: donor.bloodGroup,
            bloodType: donor.bloodGroup, // Keep bloodType for backward compatibility
            age: donor.age,
            gender: donor.gender,
            city: donor.city,
            state: donor.state,
            phone: donor.phone,
            isAvailable: donor.isAvailable,
            profilePicture: donor.profilePicture,
            donations: donor.donations,
            lastDonation: donor.lastDonation,
            createdAt: donor.createdAt
        });
    } catch (error) {
        console.error('Error updating donor profile:', error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

// Update availability status
router.patch('/availability', auth, async (req, res) => {
    try {
        const donor = await Donor.findById(req.user.userId);
        if (!donor) {
            return res.status(404).json({ message: 'Donor not found' });
        }

        donor.isAvailable = req.body.isAvailable;
        await donor.save();
        
        res.json({ message: 'Availability updated successfully', donor });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update last donation date
router.patch('/last-donation', auth, async (req, res) => {
    try {
        const donor = await Donor.findById(req.user.userId);
        if (!donor) {
            return res.status(404).json({ message: 'Donor not found' });
        }

        donor.lastDonation = new Date(req.body.lastDonation);
        await donor.save();
        
        res.json({ message: 'Last donation date updated successfully', donor });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get blood requests for donor
router.get('/blood-requests', auth, async (req, res) => {
  try {
    // Get donor's blood type
    const donor = await Donor.findById(req.user.userId);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    // Find all blood requests where:
    // 1. Donor is in the notifiedDonors array
    // 2. Blood type matches donor's blood group (optional, but keep for compatibility)
    const bloodRequests = await BloodRequest.find({
      bloodType: donor.bloodGroup,
      notifiedDonors: donor._id
    })
    .populate('hospitalId', 'name email phone city state')
    .sort({ createdAt: -1 });

    // Format the response, including donor's response (if any)
    const formattedRequests = bloodRequests.map(request => {
      // Find this donor's response if present
      const donorResponse = request.donorResponses.find(r => r.donor.equals(donor._id));
      return {
        _id: request._id,
        hospitalId: request.hospitalId._id,
        hospitalName: request.hospitalId.name,
        hospitalEmail: request.hospitalId.email,
        hospitalPhone: request.hospitalId.phone,
        hospitalLocation: `${request.hospitalId.city}, ${request.hospitalId.state}`,
        bloodType: request.bloodType,
        contactPerson: request.contactPerson,
        contactNumber: request.contactNumber,
        urgent: request.urgent,
        status: request.status,
        notifiedDonors: request.notifiedDonors,
        donorResponses: request.donorResponses,
        donorResponse: donorResponse ? {
          response: donorResponse.response,
          respondedAt: donorResponse.respondedAt
        } : null,
        acceptedBy: request.acceptedBy,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt
      };
    });

    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching blood requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all verified hospitals for donors
router.get('/hospitals', auth, async (req, res) => {
  try {
    // Only fetch verified hospitals
    const hospitals = await Hospital.find({ isVerified: true })
      .select('name email licenseNumber phone city state contactPerson createdAt requestsMade requestsCompleted')
      .sort({ name: 1 });
    
    // Format the response to include complete information
    const formattedHospitals = hospitals.map(hospital => ({
      _id: hospital._id,
      name: hospital.name,
      email: hospital.email,
      licenseNumber: hospital.licenseNumber,
      location: `${hospital.city}, ${hospital.state}`,
      city: hospital.city,
      state: hospital.state,
      contactPerson: hospital.contactPerson,
      createdAt: hospital.createdAt,
      requestsMade: hospital.requestsMade || 0,
      requestsCompleted: hospital.requestsCompleted || 0
    }));

    res.json(formattedHospitals);
  } catch (error) {
    console.error('Error fetching hospitals for donor:', error);
    res.status(500).json({ message: 'Error fetching hospitals' });
  }
});

// Respond to a blood request
router.post('/blood-requests/:requestId/respond', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { response } = req.body;

    if (!['accepted', 'rejected'].includes(response)) {
      return res.status(400).json({ message: 'Invalid response type' });
    }

    const donor = await Donor.findById(req.user.userId);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const bloodRequest = await BloodRequest.findById(requestId);
    if (!bloodRequest) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // Check if donor is notified for this request
    if (!bloodRequest.notifiedDonors.includes(donor._id)) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    // Check if request is still pending
    if (bloodRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request is no longer pending' });
    }

    // Check if donor hasn't already responded
    if (bloodRequest.donorResponses.some(r => r.donor.equals(donor._id))) {
      return res.status(400).json({ message: 'You have already responded to this request' });
    }

    // Add donor's response
    bloodRequest.donorResponses.push({
      donor: donor._id,
      response,
      respondedAt: new Date()
    });

    // If donor accepted, update request status and acceptedBy
    if (response === 'accepted') {
      bloodRequest.status = 'accepted';
      bloodRequest.acceptedBy = donor._id;
    }

    await bloodRequest.save();

    // If accepted, return full request details
    if (response === 'accepted') {
      const populatedRequest = await BloodRequest.findById(requestId)
        .populate('hospitalId', 'name email contactNumber city state')
        .populate('acceptedBy', 'name email phone');

      return res.json({
        message: 'Request accepted successfully',
        request: populatedRequest
      });
    }

    res.json({ message: 'Response recorded successfully' });
  } catch (error) {
    console.error('Error responding to blood request:', error);
    res.status(500).json({ message: 'Error responding to blood request' });
  }
});

// Get all verified hospitals for donors
router.get('/hospitals', auth, async (req, res) => {
  try {
    // Only fetch verified hospitals
    const hospitals = await Hospital.find({ isVerified: true })
      .select('name city state createdAt requestsMade requestsCompleted')
      .sort({ createdAt: -1 });
    
    // Format the response to exclude sensitive information
    const formattedHospitals = hospitals.map(hospital => ({
      _id: hospital._id,
      name: hospital.name,
      location: `${hospital.city}, ${hospital.state}`,
      city: hospital.city,
      state: hospital.state,
      createdAt: hospital.createdAt,
      requestsMade: hospital.requestsMade,
      requestsCompleted: hospital.requestsCompleted
    }));

    res.json(formattedHospitals);
  } catch (error) {
    console.error('Error fetching hospitals for donor:', error);
    res.status(500).json({ message: 'Error fetching hospitals' });
  }
});

module.exports = router;