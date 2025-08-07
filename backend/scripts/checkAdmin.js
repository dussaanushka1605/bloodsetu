const mongoose = require('mongoose');
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

async function checkAdmin() {
    try {
        // Find all admins
        const admins = await Admin.find({});
        
        console.log('\nCurrent Admins in Database:');
        admins.forEach(admin => {
            console.log('------------------------');
            console.log('Name:', admin.name);
            console.log('Email:', admin.email);
            console.log('Created At:', admin.createdAt);
        });
        
        if (admins.length === 0) {
            console.log('No admins found in database!');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

checkAdmin(); 