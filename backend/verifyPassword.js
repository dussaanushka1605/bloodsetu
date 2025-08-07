const mongoose = require('mongoose');
const Hospital = require('./models/Hospital');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function verifyPassword() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Hospital details
        const email = 'abc@gmail.com';
        const password = 'aditya';

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
            passwordLength: hospital.password?.length,
            passwordPrefix: hospital.password?.substring(0, 10)
        });

        // Direct password comparison
        const isValid = await bcrypt.compare(password, hospital.password);
        console.log('Direct password comparison result:', isValid);

        // Try with model method
        const modelResult = await hospital.comparePassword(password);
        console.log('Model method comparison result:', modelResult);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

verifyPassword(); 