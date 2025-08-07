const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Get the Donor model
const Donor = require('../models/Donor');

async function removeAddressField() {
    try {
        // Update all documents to unset the address field
        const result = await Donor.updateMany({}, { $unset: { address: 1 } });
        console.log(`Updated ${result.modifiedCount} donors - removed address field`);
    } catch (error) {
        console.error('Error removing address field:', error);
    } finally {
        mongoose.connection.close();
    }
}

removeAddressField(); 