const axios = require('axios');

const additionalDonors = [
    {
        name: "Uday More",
        email: "uday.more@gmail.com",
        password: "Uday@123",
        bloodGroup: "AB+",
        city: "Mumbai",
        state: "Maharashtra",
        phone: "9876543220",
        gender: "Male",
        age: 21
    },
    {
        name: "Jaykirti Kongari",
        email: "jaykirti.kongari@gmail.com",
        password: "Jaykirti@123",
        bloodGroup: "O-",
        city: "Solapur",
        state: "Maharashtra",
        phone: "9876543221",
        gender: "Female",
        age: 20
    },
    {
        name: "Priya Muspeth",
        email: "priya.muspeth@gmail.com",
        password: "Priya@456",
        bloodGroup: "A+",
        city: "Solapur",
        state: "Maharashtra",
        phone: "9876543222",
        gender: "Female",
        age: 19
    },
    {
        name: "Devashree Agnihotri",
        email: "devashree.agnihotri@gmail.com",
        password: "Devashree@123",
        bloodGroup: "AB+",
        city: "Kanpur",
        state: "Uttar Pradesh",
        phone: "9876543223",
        gender: "Female",
        age: 20
    },
    {
        name: "Shruti Dhumal",
        email: "shruti.dhumal@gmail.com",
        password: "Shruti@123",
        bloodGroup: "B+",
        city: "Raipur",
        state: "Chhattisgarh",
        phone: "9876543224",
        gender: "Female",
        age: 24
    },
    {
        name: "Ananya Menchekare",
        email: "ananya.menchekare@gmail.com",
        password: "Ananya@123",
        bloodGroup: "B+",
        city: "Pune",
        state: "Maharashtra",
        phone: "9876543225",
        gender: "Female",
        age: 23
    },
    {
        name: "Rohan Sharma",
        email: "rohan.sharma@gmail.com",
        password: "Rohan@123",
        bloodGroup: "O+",
        city: "Nagpur",
        state: "Maharashtra",
        phone: "9876543226",
        gender: "Male",
        age: 25
    },
    {
        name: "Neha Patel",
        email: "neha.patel@gmail.com",
        password: "Neha@123",
        bloodGroup: "A-",
        city: "Aurangabad",
        state: "Maharashtra",
        phone: "9876543227",
        gender: "Female",
        age: 22
    },
    {
        name: "Aditya Singh",
        email: "aditya.singh@gmail.com",
        password: "Aditya@123",
        bloodGroup: "B-",
        city: "Nashik",
        state: "Maharashtra",
        phone: "9876543228",
        gender: "Male",
        age: 26
    },
    {
        name: "Kavya Reddy",
        email: "kavya.reddy@gmail.com",
        password: "Kavya@123",
        bloodGroup: "AB-",
        city: "Kolhapur",
        state: "Maharashtra",
        phone: "9876543229",
        gender: "Female",
        age: 24
    }
];

async function registerAdditionalDonors() {
    console.log('Adding additional donors to the database...');
    
    for (const donor of additionalDonors) {
        try {
            const response = await axios.post('http://localhost:5001/api/auth/register/donor', donor);
            console.log(`✅ Successfully registered ${donor.name} (${donor.bloodGroup}) from ${donor.city}, ${donor.state}`);
        } catch (error) {
            if (error.response?.status === 409) {
                console.log(`⚠️  ${donor.name} already exists in database`);
            } else {
                console.error(`❌ Failed to register ${donor.name}:`, error.response?.data?.message || error.message);
            }
        }
    }
    
    console.log('✅ Additional donors registration completed!');
}

registerAdditionalDonors(); 