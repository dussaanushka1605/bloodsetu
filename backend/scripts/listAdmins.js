const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function listAdmins() {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const admins = await Admin.find({});
  console.log(admins);
  await mongoose.disconnect();
}
listAdmins(); 