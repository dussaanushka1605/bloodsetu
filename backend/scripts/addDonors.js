const axios = require('axios');

const donors = [
    {
        name: "Rahul Kumar",
        email: "rahul.kumar@gmail.com",
        password: "Rahul@123",
        bloodGroup: "A+",
        city: "Mumbai",
        state: "Maharashtra",
        phone: "9876543201",
        gender: "Male",
        age: 28
    },
    {
        name: "Priya Sharma",
        email: "priya.sharma@gmail.com",
        password: "Priya@123",
        bloodGroup: "B+",
        city: "New Delhi",
        state: "Delhi",
        phone: "9876543202",
        gender: "Female",
        age: 25
    },
    {
        name: "Amit Patel",
        email: "amit.patel@gmail.com",
        password: "Amit@123",
        bloodGroup: "O+",
        city: "Ahmedabad",
        state: "Gujarat",
        phone: "9876543203",
        gender: "Male",
        age: 30
    },
    {
        name: "Sneha Reddy",
        email: "sneha.reddy@gmail.com",
        password: "Sneha@123",
        bloodGroup: "AB+",
        city: "Hyderabad",
        state: "Telangana",
        phone: "9876543204",
        gender: "Female",
        age: 27
    },
    {
        name: "Karthik S",
        email: "karthik.s@gmail.com",
        password: "Karthik@123",
        bloodGroup: "B-",
        city: "Bangalore",
        state: "Karnataka",
        phone: "9876543205",
        gender: "Male",
        age: 32
    },
    {
        name: "Meera Nair",
        email: "meera.nair@gmail.com",
        password: "Meera@123",
        bloodGroup: "O-",
        city: "Kochi",
        state: "Kerala",
        phone: "9876543206",
        gender: "Female",
        age: 29
    },
    {
        name: "Rajesh Singh",
        email: "rajesh.singh@gmail.com",
        password: "Rajesh@123",
        bloodGroup: "A-",
        city: "Jaipur",
        state: "Rajasthan",
        phone: "9876543207",
        gender: "Male",
        age: 31
    },
    {
        name: "Anita Das",
        email: "anita.das@gmail.com",
        password: "Anita@123",
        bloodGroup: "AB-",
        city: "Kolkata",
        state: "West Bengal",
        phone: "9876543208",
        gender: "Female",
        age: 26
    },
    {
        name: "Vikram Thapar",
        email: "vikram.thapar@gmail.com",
        password: "Vikram@123",
        bloodGroup: "O+",
        city: "Chandigarh",
        state: "Punjab",
        phone: "9876543209",
        gender: "Male",
        age: 33
    },
    {
        name: "Deepa Menon",
        email: "deepa.menon@gmail.com",
        password: "Deepa@123",
        bloodGroup: "A+",
        city: "Chennai",
        state: "Tamil Nadu",
        phone: "9876543210",
        gender: "Female",
        age: 28
    },
    {
        name: "Suresh Kumar",
        email: "suresh.kumar@gmail.com",
        password: "Suresh@123",
        bloodGroup: "B+",
        city: "Lucknow",
        state: "Uttar Pradesh",
        phone: "9876543211",
        gender: "Male",
        age: 34
    },
    {
        name: "Pooja Verma",
        email: "pooja.verma@gmail.com",
        password: "Pooja@123",
        bloodGroup: "O+",
        city: "Bhopal",
        state: "Madhya Pradesh",
        phone: "9876543212",
        gender: "Female",
        age: 27
    },
    {
        name: "Arun Mishra",
        email: "arun.mishra@gmail.com",
        password: "Arun@123",
        bloodGroup: "AB+",
        city: "Patna",
        state: "Bihar",
        phone: "9876543213",
        gender: "Male",
        age: 30
    }
];

async function registerDonors() {
    for (const donor of donors) {
        try {
            const response = await axios.post('http://localhost:5001/api/auth/register/donor', donor);
            console.log(`Successfully registered ${donor.name}`);
        } catch (error) {
            console.error(`Failed to register ${donor.name}:`, error.response?.data || error.message);
        }
    }
}

registerDonors(); 