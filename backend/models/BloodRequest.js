const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    bloodType: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    contactPerson: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    urgent: {
        type: Boolean,
        default: false
    },
    isIndividual: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donor',
        default: null
    },
    notifiedDonors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donor'
    }],
    donorResponses: [{
        donor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Donor',
            required: true
        },
        response: {
            type: String,
            enum: ['accepted', 'rejected'],
            required: true
        },
        respondedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Add index for faster queries
bloodRequestSchema.index({ bloodType: 1, status: 1 });
bloodRequestSchema.index({ hospitalId: 1, status: 1 });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
