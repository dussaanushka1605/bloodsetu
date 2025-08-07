const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

async function verifyAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Find admin user
        const admin = await Admin.findOne({ email: 'admin@raktsetu.com' });
        if (admin) {
            console.log('✅ Admin found successfully!');
            console.log('Admin details:');
            console.log('- Name:', admin.name);
            console.log('- Email:', admin.email);
            console.log('- Role:', admin.role);
        } else {
            console.log('❌ Admin not found. Creating new admin...');
            // Create admin user
            const newAdmin = new Admin({
                name: "Admin User",
                email: "admin@raktsetu.com",
                password: "Admin@123",
                role: "admin"
            });
            await newAdmin.save();
            console.log('✅ New admin created successfully!');
        }

        // Close the connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error:', error);
        if (mongoose.connection) {
            await mongoose.connection.close();
        }
    }
}

// Run the function
verifyAdmin(); 