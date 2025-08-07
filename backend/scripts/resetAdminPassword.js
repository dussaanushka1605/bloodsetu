const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Admin model
const Admin = require('../models/Admin');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

const newPassword = 'admin123';

async function resetAdminPassword() {
    try {
        // Find admin by email
        const admin = await Admin.findOne({ email: 'admin@raktsetu.com' });
        
        if (admin) {
            // Hash and update password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await Admin.updateOne(
                { email: 'admin@raktsetu.com' },
                { $set: { password: hashedPassword } }
            );
            console.log('Admin password reset successfully');
            console.log('\nNew Admin Credentials:');
            console.log('Email:', admin.email);
            console.log('Password:', newPassword);
        } else {
            console.log('Admin not found!');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

resetAdminPassword(); 