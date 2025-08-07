const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixHospitalPassword() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Hospital details
        const email = 'abc@gmail.com';
        const newPassword = 'aditya';

        // Find hospital
        const hospital = await Hospital.findOne({ email: email.toLowerCase() });
        
        if (!hospital) {
            console.log('No hospital found with email:', email);
            return;
        }

        console.log('Hospital found:', {
            id: hospital._id,
            email: hospital.email,
            name: hospital.name,
            currentPassword: hospital.password,
            isPasswordHashed: hospital.password?.startsWith('$2b$')
        });

        // Set new password (will be hashed by pre-save hook)
        hospital.password = newPassword;
        await hospital.save();

        console.log('Password fixed successfully');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

fixHospitalPassword(); 