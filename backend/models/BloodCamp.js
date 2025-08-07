const mongoose = require('mongoose');

const bloodCampSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    contactInfo: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    interestedDonors: [{
        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Donor'
        },
        status: {
            type: String,
            enum: ['registered', 'attended', 'no-show'],
            default: 'registered'
        },
        registeredAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Add index for faster queries
bloodCampSchema.index({ date: 1 });
bloodCampSchema.index({ createdBy: 1 });

module.exports = mongoose.model('BloodCamp', bloodCampSchema);