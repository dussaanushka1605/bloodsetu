const express = require('express');
const router = express.Router();
const BloodCamp = require('../models/BloodCamp');
const Hospital = require('../models/Hospital');
const Donor = require('../models/Donor');
const History = require('../models/History');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
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

// Create a new blood camp (Hospital only)
router.post('/', auth, async (req, res) => {
  try {
    // Verify hospital authentication
    const hospital = await Hospital.findById(req.user.userId);
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    if (!hospital.isVerified) {
      return res.status(403).json({ message: 'Hospital not verified' });
    }
    if (req.user.role !== 'hospital') {
      return res.status(403).json({ message: 'Only hospitals can create blood camps' });
    }

    // Extract camp details from request body
    const {
      title,
      description,
      location,
      date,
      time,
      contactInfo
    } = req.body;

    // Validate required fields
    if (!title || !description || !location || !date || !time || !contactInfo) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new blood camp
    const bloodCamp = new BloodCamp({
      createdBy: hospital._id,
      title,
      description,
      location,
      date: new Date(date),
      time,
      contactInfo,
      status: 'upcoming',
      interestedDonors: []
    });

    // Save blood camp
    await bloodCamp.save();

    // Save blood camp without donor notification for now
    // We'll implement proper donor notification later

    // Return the created blood camp
    res.status(201).json(bloodCamp);
  } catch (error) {
    console.error('Error creating blood camp:', error);
    res.status(500).json({ message: error.message });
  }
});
// Get all blood camps (public)
router.get('/public', async (req, res) => {
  try {
    const { location, status } = req.query;
    const filter = {};

    // Apply filters if provided
    if (location) filter.location = { $regex: new RegExp(location, 'i') };
    // Status filter can be implemented later if needed

    // Find blood camps with filters
    const bloodCamps = await BloodCamp.find(filter)
      .populate('createdBy', 'name location')
      .sort({ date: 1 });

    res.json(bloodCamps);
  } catch (error) {
    console.error('Error fetching blood camps:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get blood camps for a specific hospital
router.get('/hospital', auth, async (req, res) => {
  try {
    // Verify hospital authentication
    if (req.user.role !== 'hospital') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filter = { createdBy: req.user.userId };
    
    // Apply status filter if provided
    if (req.query.status) {
      if (req.query.status === 'upcoming') {
        filter.status = { $in: ['upcoming'] };
      } else if (req.query.status === 'completed') {
        filter.status = { $in: ['completed', 'cancelled'] };
      }
    }

    // Find blood camps for this hospital
    const bloodCamps = await BloodCamp.find(filter)
      .populate({
        path: 'interestedDonors.donor',
        select: 'name email phone bloodGroup city state'
      })
      .sort({ date: -1 });

    res.json(bloodCamps);
  } catch (error) {
    console.error('Error fetching hospital blood camps:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all blood camps for admin dashboard
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    console.log(`Admin blood camps request received from user: ${req.user.userId}`);
    
    // Find all blood camps with populated data
    const bloodCamps = await BloodCamp.find({})
      .populate('createdBy', 'name location email phone')
      .populate({
        path: 'interestedDonors.donor',
        select: 'name email phone bloodGroup city state'
      })
      .sort({ date: -1 });
    
    // Log success and count of camps found
    console.log(`Successfully retrieved ${bloodCamps.length} blood camps for admin dashboard`);
    
    // Set cache control headers to prevent caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Expires', '0');
    res.set('Pragma', 'no-cache');
    
    res.json(bloodCamps);
  } catch (error) {
    console.error('Error fetching admin blood camps:', error);
    res.status(500).json({ 
      message: 'Failed to fetch blood camps', 
      detail: error.message 
    });
  }
});

// Get blood camps for a specific donor
router.get('/donor', auth, async (req, res) => {
  try {
    // Verify donor authentication
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const donor = await Donor.findById(req.user.userId);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const { interested } = req.query;
    let filter = {
      // By default, only show upcoming and ongoing camps
      status: { $in: ['upcoming', 'ongoing'] }
    };

    // If interested=true, only show camps where donor has registered interest
    if (interested === 'true') {
      filter['interestedDonors.donor'] = donor._id;
    }

    // Find blood camps for this donor
    const bloodCamps = await BloodCamp.find(filter)
      .populate('createdBy', 'name location')
      .sort({ date: 1 });

    // Format response to include whether donor is interested
    const formattedCamps = bloodCamps.map(camp => {
      const isInterested = camp.interestedDonors.some(item => 
        item.donor && (item.donor._id || item.donor).equals(donor._id)
      );
      
      return {
        _id: camp._id,
        title: camp.title,
        description: camp.description,
        location: camp.location,
        date: camp.date,
        time: camp.time,
        contactInfo: camp.contactInfo,
        hospital: camp.createdBy,
        isInterested,
        interestedDonorsCount: camp.interestedDonors.length,
        createdAt: camp.createdAt,
        updatedAt: camp.updatedAt
      };
    });

    res.json(formattedCamps);
  } catch (error) {
    console.error('Error fetching donor blood camps:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a specific blood camp by ID
router.get('/:id', async (req, res) => {
  try {
    const bloodCamp = await BloodCamp.findById(req.params.id)
      .populate('createdBy', 'name location phone email')
      .populate({
        path: 'interestedDonors.donor',
        select: 'name email phone bloodGroup city state'
      });

    if (!bloodCamp) {
      return res.status(404).json({ message: 'Blood camp not found' });
    }

    res.json(bloodCamp);
  } catch (error) {
    console.error('Error fetching blood camp:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update a blood camp (Hospital only)
router.patch('/:id', auth, async (req, res) => {
  try {
    // Verify hospital authentication
    if (req.user.role !== 'hospital') {
      return res.status(403).json({ message: 'Only hospitals can update blood camps' });
    }

    const bloodCamp = await BloodCamp.findById(req.params.id);
    if (!bloodCamp) {
      return res.status(404).json({ message: 'Blood camp not found' });
    }

    // Verify that the hospital owns this blood camp
    if (!bloodCamp.createdBy.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to update this blood camp' });
    }

    // Update fields if provided
    const updateFields = [
      'title', 'description', 'location', 'date', 'time', 'contactInfo'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'date') {
          bloodCamp[field] = new Date(req.body[field]);
        } else {
          bloodCamp[field] = req.body[field];
        }
      }
    });

    await bloodCamp.save();

    res.json({
      message: 'Blood camp updated successfully',
      bloodCamp
    });
  } catch (error) {
    console.error('Error updating blood camp:', error);
    res.status(500).json({ message: error.message });
  }
});

// Register interest in a blood camp (Donor only)
router.post('/:id/interest', auth, async (req, res) => {
  try {
    // Verify donor authentication
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only donors can register interest' });
    }

    const donor = await Donor.findById(req.user.userId);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const bloodCamp = await BloodCamp.findById(req.params.id);
    if (!bloodCamp) {
      return res.status(404).json({ message: 'Blood camp not found' });
    }

    // Check if donor is already registered
    const alreadyRegistered = bloodCamp.interestedDonors.some(item => item.donor && item.donor.equals(donor._id));

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this blood camp' });
    }

    // Add donor to interested donors
    bloodCamp.interestedDonors.push({
      donor: donor._id,
      status: 'registered',
      registeredAt: new Date()
    });

    await bloodCamp.save();

    // Create history record for the registration
    if (History) {
      await History.create({
        userId: donor._id,
        userType: 'Donor',
        action: 'register_blood_camp',
        details: { 
          campId: bloodCamp._id,
          campTitle: bloodCamp.title,
          campDate: bloodCamp.date
        },
        date: new Date()
      });
    }

    res.json({
      message: 'Successfully registered interest in blood camp',
      bloodCamp: {
        _id: bloodCamp._id,
        title: bloodCamp.title,
        date: bloodCamp.date,
        location: bloodCamp.location,
        interestedDonorsCount: bloodCamp.interestedDonors.length
      }
    });
  } catch (error) {
    console.error('Error registering interest in blood camp:', error);
    res.status(500).json({ message: error.message });
  }
});

// Cancel interest in a blood camp (Donor only)
router.delete('/:id/interest', auth, async (req, res) => {
  try {
    // Verify donor authentication
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Only donors can cancel interest' });
    }

    const donor = await Donor.findById(req.user.userId);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const bloodCamp = await BloodCamp.findById(req.params.id);
    if (!bloodCamp) {
      return res.status(404).json({ message: 'Blood camp not found' });
    }

    // Check if donor is registered
    const donorIndex = bloodCamp.interestedDonors.findIndex(item => item.donor && item.donor.equals(donor._id));

    if (donorIndex === -1) {
      return res.status(400).json({ message: 'You are not registered for this blood camp' });
    }

    // Remove donor from interested donors
    bloodCamp.interestedDonors.splice(donorIndex, 1);
    await bloodCamp.save();

    // Create history record for cancellation
    if (History) {
      await History.create({
        userId: donor._id,
        userType: 'Donor',
        action: 'cancel_blood_camp_registration',
        details: { 
          campId: bloodCamp._id,
          campTitle: bloodCamp.title,
          campDate: bloodCamp.date
        },
        date: new Date()
      });
    }

    res.json({
      message: 'Successfully cancelled interest in blood camp',
      bloodCampId: bloodCamp._id,
      interestedDonorsCount: bloodCamp.interestedDonors.length
    });
  } catch (error) {
    console.error('Error cancelling interest in blood camp:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update donor attendance status (Hospital only)
router.patch('/:id/attendance/:donorId', auth, async (req, res) => {
  try {
    // Verify hospital authentication
    if (req.user.role !== 'hospital') {
      return res.status(403).json({ message: 'Only hospitals can update attendance' });
    }

    const { status } = req.body;
    if (!status || !['registered', 'attended', 'no-show'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const bloodCamp = await BloodCamp.findById(req.params.id);
    if (!bloodCamp) {
      return res.status(404).json({ message: 'Blood camp not found' });
    }

    // Verify that the hospital owns this blood camp
    if (!bloodCamp.createdBy.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to update this blood camp' });
    }

    // Find the donor in the interested donors array
    const donorIndex = bloodCamp.interestedDonors.findIndex(
      item => item.donor && item.donor.toString() === req.params.donorId
    );

    if (donorIndex === -1) {
      return res.status(404).json({ message: 'Donor not registered for this blood camp' });
    }

    // Update the donor's status
    bloodCamp.interestedDonors[donorIndex].status = status;
    await bloodCamp.save();

    res.json({
      message: 'Donor attendance status updated successfully',
      donorId: req.params.donorId,
      status
    });
  } catch (error) {
    console.error('Error updating donor attendance:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a blood camp (Hospital only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Verify hospital authentication
    if (req.user.role !== 'hospital') {
      return res.status(403).json({ message: 'Only hospitals can delete blood camps' });
    }

    const bloodCamp = await BloodCamp.findById(req.params.id);
    if (!bloodCamp) {
      return res.status(404).json({ message: 'Blood camp not found' });
    }

    // Verify that the hospital owns this blood camp
    if (!bloodCamp.createdBy.equals(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to delete this blood camp' });
    }
    
    // Delete the blood camp
    await BloodCamp.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blood camp deleted successfully' });
  } catch (error) {
    console.error('Error deleting blood camp:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin route to manually trigger blood camp status update
router.post('/admin/update-status', auth, async (req, res) => {
  try {
    // Verify admin authentication
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can trigger this update' });
    }

    // Import the blood camp scheduler
    const { updateBloodCampStatus } = require('../jobs/bloodCampScheduler');
    
    // Run the update
    const result = await updateBloodCampStatus();
    
    res.json({
      message: 'Blood camp status update triggered successfully',
      result
    });
  } catch (error) {
    console.error('Error triggering blood camp status update:', error);
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;