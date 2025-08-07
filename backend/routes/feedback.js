const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Feedback = require('../models/Feedback');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');

// Submit feedback (for both donors and hospitals)
router.post('/submit', auth, async (req, res) => {
    try {
        const { description } = req.body;
        
        if (!description) {
            return res.status(400).json({ message: 'Description is required' });
        }

        // Determine user type based on role
        let userType;
        if (req.user.role === 'donor') {
            userType = 'Donor';
        } else if (req.user.role === 'hospital') {
            userType = 'Hospital';
        } else {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        const feedback = new Feedback({
            userId: req.user.userId || req.user.id,
            userType,
            description,
            status: 'pending'
        });

        await feedback.save();

        res.status(201).json({
            message: 'Feedback submitted successfully',
            feedback
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Error submitting feedback', error: error.message });
    }
});

// Get all feedbacks for a specific user
router.get('/history', auth, async (req, res) => {
    try {
        // Determine user type based on role
        let userType;
        if (req.user.role === 'donor') {
            userType = 'Donor';
        } else if (req.user.role === 'hospital') {
            userType = 'Hospital';
        } else {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        console.log('Feedback history request:', {
            userId: req.user.id || req.user.userId || req.user._id,
            role: req.user.role,
            userType
        });

        // Use userId from token, which could be in different properties
        const userId = req.user.id || req.user.userId || req.user._id;
        
        const feedbacks = await Feedback.find({
            userId: userId,
            userType
        }).sort({ createdAt: -1 });

        console.log(`Found ${feedbacks.length} feedbacks for user ${userId}`);
        res.json(feedbacks);
    } catch (error) {
        console.error('Error fetching feedback history:', error);
        res.status(500).json({ message: 'Error fetching feedback history', error: error.message });
    }
});

// Get all responded feedbacks for a specific user
router.get('/responses', auth, async (req, res) => {
    try {
        // Determine user type based on role
        let userType;
        if (req.user.role === 'donor') {
            userType = 'Donor';
        } else if (req.user.role === 'hospital') {
            userType = 'Hospital';
        } else {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        console.log('Feedback responses request:', {
            userId: req.user.id || req.user.userId || req.user._id,
            role: req.user.role,
            userType
        });

        // Use userId from token, which could be in different properties
        const userId = req.user.id || req.user.userId || req.user._id;

        const feedbacks = await Feedback.find({
            userId: userId,
            userType,
            status: 'responded'
        }).sort({ 'response.timestamp': -1 });

        res.json(feedbacks);
    } catch (error) {
        console.error('Error fetching feedback responses:', error);
        res.status(500).json({ message: 'Error fetching feedback responses', error: error.message });
    }
});

// Admin routes

// Get all pending feedbacks (admin only)
router.get('/admin/pending', adminAuth, async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ status: 'pending' })
            .sort({ createdAt: -1 });

        // Populate user details
        const populatedFeedbacks = await Promise.all(feedbacks.map(async (feedback) => {
            const feedbackObj = feedback.toObject();
            
            if (feedback.userType === 'Donor') {
                const donor = await Donor.findById(feedback.userId, 'name email');
                if (donor) {
                    feedbackObj.user = donor;
                }
            } else if (feedback.userType === 'Hospital') {
                const hospital = await Hospital.findById(feedback.userId, 'name email');
                if (hospital) {
                    feedbackObj.user = hospital;
                }
            }
            
            return feedbackObj;
        }));

        res.json(populatedFeedbacks);
    } catch (error) {
        console.error('Error fetching pending feedbacks:', error);
        res.status(500).json({ message: 'Error fetching pending feedbacks', error: error.message });
    }
});

// Get all responded feedbacks (admin only)
router.get('/admin/responded', adminAuth, async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ status: 'responded' })
            .sort({ 'response.timestamp': -1 });

        // Populate user details
        const populatedFeedbacks = await Promise.all(feedbacks.map(async (feedback) => {
            const feedbackObj = feedback.toObject();
            
            if (feedback.userType === 'Donor') {
                const donor = await Donor.findById(feedback.userId, 'name email');
                if (donor) {
                    feedbackObj.user = donor;
                }
            } else if (feedback.userType === 'Hospital') {
                const hospital = await Hospital.findById(feedback.userId, 'name email');
                if (hospital) {
                    feedbackObj.user = hospital;
                }
            }
            
            return feedbackObj;
        }));

        res.json(populatedFeedbacks);
    } catch (error) {
        console.error('Error fetching responded feedbacks:', error);
        res.status(500).json({ message: 'Error fetching responded feedbacks', error: error.message });
    }
});

// Respond to feedback (admin only)
router.post('/admin/respond/:id', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { responseText } = req.body;

        if (!responseText) {
            return res.status(400).json({ message: 'Response text is required' });
        }

        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        feedback.status = 'responded';
        feedback.response = {
            text: responseText,
            adminId: req.user.id,
            timestamp: new Date()
        };

        await feedback.save();

        res.json({
            message: 'Response submitted successfully',
            feedback
        });
    } catch (error) {
        console.error('Error responding to feedback:', error);
        res.status(500).json({ message: 'Error responding to feedback', error: error.message });
    }
});

module.exports = router;