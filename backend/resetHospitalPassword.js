const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetHospitalPassword() {
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
            name: hospital.name
        });

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        hospital.password = hashedPassword;
        await hospital.save();

        console.log('Password reset successful');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

resetHospitalPassword(); 