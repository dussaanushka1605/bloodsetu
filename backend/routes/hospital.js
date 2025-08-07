const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
const Donor = require('../models/Donor');
const BloodRequest = require('../models/BloodRequest');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

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

// Get hospital profile
router.get('/profile', auth, async (req, res) => {
    try {
        console.log('Fetching hospital profile for userId:', req.user.userId);
        const hospital = await Hospital.findById(req.user.userId)
            .select('name email licenseNumber phone city state contactPerson isVerified requestsMade requestsCompleted createdAt profilePicture');
        
        if (!hospital) {
            console.log('Hospital not found for userId:', req.user.userId);
            return res.status(404).json({ message: 'Hospital not found' });
        }

        console.log('Found hospital:', {
            id: hospital._id,
            name: hospital.name,
            isVerified: hospital.isVerified,
            contactPerson: hospital.contactPerson,
            hasProfilePicture: !!hospital.profilePicture
        });

        // Always return the hospital data, regardless of verification status
        res.json(hospital);
    } catch (error) {
        console.error('Error in /profile:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update blood bank inventory
router.patch('/inventory', auth, async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.user.userId);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        if (!hospital.isVerified) {
            return res.status(403).json({ message: 'Hospital not verified yet' });
        }

        const { bloodGroup, units } = req.body;
        const bloodGroupIndex = hospital.availableBloodGroups.findIndex(
            bg => bg.bloodGroup === bloodGroup
        );

        if (bloodGroupIndex === -1) {
            hospital.availableBloodGroups.push({ bloodGroup, units });
        } else {
            hospital.availableBloodGroups[bloodGroupIndex].units = units;
        }

        await hospital.save();
        res.json({ message: 'Inventory updated successfully', hospital });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Search for donors
router.get('/search-donors', auth, async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.user.userId);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        if (!hospital.isVerified) {
            return res.status(403).json({ message: 'Hospital not verified yet' });
        }

        const { bloodGroup } = req.query;
        const query = {};
        
        if (bloodGroup && bloodGroup !== 'all') {
            query.bloodGroup = bloodGroup;
        }

        console.log('Searching donors with query:', query);

        const donors = await Donor.find(query)
            .select('name email bloodGroup age gender city state phone lastDonation donations createdAt')
            .sort({ createdAt: -1 });

        console.log(`Found ${donors.length} donors matching criteria:`, {
            bloodGroup,
            totalDonors: donors.length
        });

        res.json(donors);
    } catch (error) {
        console.error('Error searching donors:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update hospital profile
router.patch('/profile', auth, async (req, res) => {
    try {
        const hospitalId = req.user.userId;
        const updateData = {};
        
        // Extract fields from request body
        const allowedUpdates = ['name', 'phone', 'city', 'state', 'contactPerson'];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });
        
        // Profile picture feature has been removed
        
        console.log('Updating hospital profile with data:', updateData);
        
        const hospital = await Hospital.findById(hospitalId);
        
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }
        
        // Update hospital with new data
        Object.keys(updateData).forEach(key => {
            hospital[key] = updateData[key];
        });
        
        await hospital.save();
        
        // Return updated hospital data
        res.json({
            message: 'Profile updated successfully',
            hospital: {
                _id: hospital._id,
                name: hospital.name,
                email: hospital.email,
                licenseNumber: hospital.licenseNumber,
                phone: hospital.phone,
                city: hospital.city,
                state: hospital.state,
                contactPerson: hospital.contactPerson,
                isVerified: hospital.isVerified,
                profilePicture: hospital.profilePicture
            }
        });
    } catch (error) {
        console.error('Error updating hospital profile:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get blood requests for a hospital
router.get('/blood-requests', auth, async (req, res) => {
    try {
        console.log('Fetching blood requests for hospital:', req.user.userId);
        
        // Get hospital details
        const hospital = await Hospital.findById(req.user.userId);
        if (!hospital) {
            console.error('Hospital not found for ID:', req.user.userId);
            return res.status(404).json({ message: 'Hospital not found' });
        }

        console.log('Found hospital:', {
            id: hospital._id,
            name: hospital.name,
            isVerified: hospital.isVerified
        });

        // Find all blood requests for this hospital
        const bloodRequests = await BloodRequest.find({ hospitalId: req.user.userId })
            .sort({ createdAt: -1 })
            .populate('hospitalId', 'name email phone city state')
            .populate('notifiedDonors', 'name email phone bloodGroup')
            .populate('acceptedBy', 'name email phone bloodGroup');

        console.log('Found blood requests:', bloodRequests.length);

        // Format the response
        const formattedRequests = bloodRequests.map(request => ({
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
            notifiedDonors: request.notifiedDonors.map(donor => ({
                _id: donor._id,
                name: donor.name,
                email: donor.email,
                phone: donor.phone,
                bloodGroup: donor.bloodGroup
            })),
            donorResponses: request.donorResponses,
            acceptedBy: request.acceptedBy ? {
                _id: request.acceptedBy._id,
                name: request.acceptedBy.name,
                email: request.acceptedBy.email,
                phone: request.acceptedBy.phone,
                bloodGroup: request.acceptedBy.bloodGroup
            } : null,
            createdAt: request.createdAt,
            updatedAt: request.updatedAt
        }));

        console.log('Sending formatted requests:', formattedRequests.length);
        res.json(formattedRequests);
    } catch (error) {
        console.error('Error fetching blood requests:', {
            message: error.message,
            stack: error.stack,
            userId: req.user?.userId
        });
        res.status(500).json({ 
            message: 'Error fetching blood requests',
            error: error.message
        });
    }
});

// Create a new blood request
router.post('/blood-requests', auth, async (req, res) => {
  try {
    console.log('Received blood request creation request:', req.body);
    // Validate hospital
    const hospital = await Hospital.findById(req.user.userId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    if (!hospital.isVerified) {
      return res.status(403).json({ message: 'Hospital not verified' });
    }
    const { bloodType, contactPerson, contactNumber, urgent, donorId } = req.body;
    // Validate required fields
    if (!bloodType || !contactPerson || !contactNumber) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Validate blood type
    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodTypes.includes(bloodType)) {
      return res.status(400).json({ message: 'Invalid blood type' });
    }
    let notifiedDonors = [];
    let isIndividual = false;
    if (donorId) {
      // Send request to a specific donor
      const donor = await Donor.findById(donorId);
      if (!donor) {
        return res.status(404).json({ message: 'Donor not found' });
      }
      notifiedDonors = [donor._id];
      isIndividual = true;
    } else {
      // Find donors with matching blood type
      console.log('Searching for donors with blood type:', bloodType);
      const eligibleDonors = await Donor.find({
        bloodGroup: bloodType
      }).select('_id name email phone bloodGroup');
      notifiedDonors = eligibleDonors.map(donor => donor._id);
      console.log('Found eligible donors:', eligibleDonors.length, eligibleDonors);
      if (eligibleDonors.length === 0) {
        console.log('No donors found with blood type:', bloodType);
      }
      isIndividual = false;
    }
    // Create blood request
    const bloodRequest = new BloodRequest({
      hospitalId: hospital._id,
      bloodType,
      contactPerson,
      contactNumber,
      urgent,
      notifiedDonors,
      donorResponses: [],
      status: 'pending',
      isIndividual
    });
    await bloodRequest.save();
    console.log('Blood request created:', bloodRequest._id);
    // Update hospital's requests made count
    hospital.requestsMade += 1;
    await hospital.save();
    // Populate the response with donor details
    const populatedRequest = await BloodRequest.findById(bloodRequest._id)
      .populate('hospitalId', 'name email phone city state')
      .populate('notifiedDonors', 'name email phone bloodGroup');
    // Return response with eligible donors count
    res.status(201).json({
      message: 'Blood request created successfully',
      requestId: bloodRequest._id,
      notifiedDonorsCount: notifiedDonors.length,
      request: {
        _id: populatedRequest._id,
        hospitalId: populatedRequest.hospitalId._id,
        hospitalName: populatedRequest.hospitalId.name,
        hospitalEmail: populatedRequest.hospitalId.email,
        hospitalPhone: populatedRequest.hospitalId.phone,
        hospitalLocation: `${populatedRequest.hospitalId.city}, ${populatedRequest.hospitalId.state}`,
        bloodType: populatedRequest.bloodType,
        contactPerson: populatedRequest.contactPerson,
        contactNumber: populatedRequest.contactNumber,
        urgent: populatedRequest.urgent,
        status: populatedRequest.status,
        notifiedDonors: populatedRequest.notifiedDonors.map(donor => ({
          _id: donor._id,
          name: donor.name,
          email: donor.email,
          phone: donor.phone,
          bloodGroup: donor.bloodGroup
        })),
        donorResponses: populatedRequest.donorResponses,
        createdAt: populatedRequest.createdAt,
        updatedAt: populatedRequest.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating blood request:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update blood request status
router.patch('/blood-requests/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const bloodRequest = await BloodRequest.findById(req.params.id);

        if (!bloodRequest) {
            return res.status(404).json({ message: 'Blood request not found' });
        }

        if (bloodRequest.hospitalId.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to update this request' });
        }

        bloodRequest.status = status;
        await bloodRequest.save();

        res.json(bloodRequest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get blood request details
router.get('/blood-requests/:requestId', auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const bloodRequest = await BloodRequest.findOne({
      _id: requestId,
      hospitalId: req.user.userId
    })
    .populate('hospitalId', 'name email contactNumber city state')
    .populate('notifiedDonors', 'name email phone bloodGroup city state lastDonation')
    .populate('acceptedBy', 'name email phone bloodGroup city state lastDonation')
    .populate('donorResponses.donor', 'name');

    if (!bloodRequest) {
      return res.status(404).json({ message: 'Blood request not found' });
    }

    // Format the response
    const response = {
      _id: bloodRequest._id,
      hospitalId: bloodRequest.hospitalId._id,
      hospitalName: bloodRequest.hospitalId.name,
      bloodType: bloodRequest.bloodType,
      contactPerson: bloodRequest.contactPerson,
      contactNumber: bloodRequest.contactNumber,
      urgent: bloodRequest.urgent,
      status: bloodRequest.status,
      createdAt: bloodRequest.createdAt,
      updatedAt: bloodRequest.updatedAt,
      notifiedDonors: bloodRequest.notifiedDonors.map(donor => ({
        _id: donor._id,
        name: donor.name,
        bloodGroup: donor.bloodGroup,
        phone: donor.phone,
        city: donor.city,
        state: donor.state,
        lastDonation: donor.lastDonation
      })),
      donorResponses: bloodRequest.donorResponses,
      acceptedBy: bloodRequest.acceptedBy ? {
        _id: bloodRequest.acceptedBy._id,
        name: bloodRequest.acceptedBy.name,
        bloodGroup: bloodRequest.acceptedBy.bloodGroup,
        phone: bloodRequest.acceptedBy.phone,
        city: bloodRequest.acceptedBy.city,
        state: bloodRequest.acceptedBy.state
      } : undefined
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching blood request details:', error);
    res.status(500).json({ message: 'Error fetching blood request details' });
  }
});

module.exports = router;