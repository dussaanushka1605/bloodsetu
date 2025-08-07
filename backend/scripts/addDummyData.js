const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const randomNames = [
  'Amit', 'Priya', 'Rahul', 'Sneha', 'Vikas', 'Neha', 'Rohan', 'Pooja', 'Karan', 'Simran',
  'Ankit', 'Meera', 'Sahil', 'Ritu', 'Arjun', 'Divya', 'Manish', 'Kavita', 'Nikhil', 'Shreya'
];

function getRandomName() {
  return randomNames[Math.floor(Math.random() * randomNames.length)] + Math.floor(Math.random() * 1000);
}

async function addDummyData() {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Add 10 donors
  const donorDocs = [];
  for (let i = 0; i < 10; i++) {
    const name = getRandomName();
    donorDocs.push({
      name,
      email: `${name.toLowerCase()}@gmail.com`,
      password: hashedPassword,
      bloodGroup: ['A+', 'B+', 'O+', 'AB+'][i % 4],
      phone: `98765432${100 + i}`,
      city: 'City' + i,
      state: 'State' + i,
      age: 20 + (i % 30),
      gender: i % 2 === 0 ? 'Male' : 'Female'
    });
  }
  await Donor.insertMany(donorDocs);
  console.log('Added 10 dummy donors');

  // Add 10 hospitals
  const hospitalDocs = [];
  for (let i = 0; i < 10; i++) {
    const name = getRandomName();
    hospitalDocs.push({
      name,
      email: `${name.toLowerCase()}@gmail.com`,
      password: hashedPassword,
      licenseNumber: `LIC${1000 + i}`,
      phone: `91234567${100 + i}`,
      city: 'City' + i,
      state: 'State' + i,
      contactPerson: 'Contact ' + name,
      isVerified: i % 2 === 0 // Half verified, half pending
    });
  }
  await Hospital.insertMany(hospitalDocs);
  console.log('Added 10 dummy hospitals');

  await mongoose.disconnect();
  console.log('Database connection closed');
}

addDummyData(); 