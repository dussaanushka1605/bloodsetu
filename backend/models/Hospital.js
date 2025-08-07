const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    lastLogin: {
        type: Date
    },
    licenseNumber: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    contactPerson: {
        type: String,
        required: true,
        trim: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    requestsMade: {
        type: Number,
        default: 0
    },
    requestsCompleted: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    role: {
        type: String,
        default: 'hospital'
    }
}, {
    timestamps: true
});

// Method to compare password
hospitalSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('Password comparison:', {
            candidateLength: candidatePassword?.length,
            storedLength: this.password?.length,
            storedPrefix: this.password?.substring(0, 10)
        });
        
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('Password match result:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

const Hospital = mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;