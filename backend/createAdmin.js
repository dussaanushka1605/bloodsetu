const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Create admin user
        const admin = new Admin({
            name: "Admin User",
            email: "admin@raktsetu.com",
            password: "Admin@123",
            role: "admin"
        });

        await admin.save();
        console.log('Admin created successfully:', admin);

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
createAdmin(); 