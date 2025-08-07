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

const adminData = {
    email: 'admin@raktsetu.com'.trim().toLowerCase(),
    password: 'Admin@123',
    name: 'Admin User'
};

async function createAdmin() {
    try {
        console.log('Checking for existing admin...');
        // Check if admin exists
        const existingAdmin = await Admin.findOne({ email: adminData.email });
        
        if (existingAdmin) {
            console.log('Admin already exists. Updating password...');
            // Update admin password
            const hashedPassword = await bcrypt.hash(adminData.password, 10);
            await Admin.updateOne(
                { email: adminData.email },
                { $set: { password: hashedPassword } }
            );
            console.log('✅ Admin password reset successfully');
        } else {
            console.log('No admin found. Creating new admin...');
            // Create new admin
            const hashedPassword = await bcrypt.hash(adminData.password, 10);
            const admin = new Admin({
                email: adminData.email,
                password: hashedPassword,
                name: adminData.name,
                role: 'admin'
            });
            await admin.save();
            console.log('✅ Admin created successfully');
        }

        console.log('\n📝 Admin Credentials:');
        console.log('Email:', adminData.email);
        console.log('Password:', adminData.password);
        console.log('\n⚠️ Please save these credentials securely!');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

// Run the function
createAdmin(); 