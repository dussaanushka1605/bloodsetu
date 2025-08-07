const mongoose = require('mongoose');
const Donor = require('./models/Donor');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const dummyDonors = [
    {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "Password123",
        bloodGroup: "A+",
        phone: "9876543210",
        city: "Mumbai",
        state: "Maharashtra",
        age: 25,
        gender: "Male",
        isAvailable: true
    },
    {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        password: "Password123",
        bloodGroup: "B+",
        phone: "9876543211",
        city: "Delhi",
        state: "Delhi",
        age: 30,
        gender: "Female",
        isAvailable: true
    },
    {
        name: "Raj Kumar",
        email: "raj.kumar@example.com",
        password: "Password123",
        bloodGroup: "O+",
        phone: "9876543212",
        city: "Bangalore",
        state: "Karnataka",
        age: 28,
        gender: "Male",
        isAvailable: true
    },
    {
        name: "Priya Patel",
        email: "priya.patel@example.com",
        password: "Password123",
        bloodGroup: "AB+",
        phone: "9876543213",
        city: "Pune",
        state: "Maharashtra",
        age: 32,
        gender: "Female",
        isAvailable: true
    },
    {
        name: "Amit Shah",
        email: "amit.shah@example.com",
        password: "Password123",
        bloodGroup: "O-",
        phone: "9876543214",
        city: "Chennai",
        state: "Tamil Nadu",
        age: 35,
        gender: "Male",
        isAvailable: true
    },
    {
        name: "Priya Muspeth",
        email: "priyamuspeth0@gmail.com",
        password: "Password123",
        bloodGroup: "O+",
        phone: "+918246374685",
        city: "Mumbai",
        state: "Maharashtra",
        age: 21,
        gender: "Female",
        isAvailable: true
    }
];

async function seedDonors() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Clear existing donors
        await Donor.deleteMany({});
        console.log('Cleared existing donors');

        // Hash passwords and create donors
        const donorsWithHashedPasswords = await Promise.all(
            dummyDonors.map(async (donor) => {
                const hashedPassword = await bcrypt.hash(donor.password, 10);
                return {
                    ...donor,
                    password: hashedPassword
                };
            })
        );

        // Insert donors
        const insertedDonors = await Donor.insertMany(donorsWithHashedPasswords);
        console.log('Added dummy donors:', insertedDonors.map(d => ({ name: d.name, email: d.email, bloodGroup: d.bloodGroup })));

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
seedDonors(); 