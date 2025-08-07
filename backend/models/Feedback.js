const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userType'
    },
    userType: {
        type: String,
        required: true,
        enum: ['Donor', 'Hospital']
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'responded'],
        default: 'pending'
    },
    response: {
        text: String,
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        timestamp: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);