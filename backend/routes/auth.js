const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const Admin = require('../models/Admin');
const History = require('../models/History');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

// OTP store (in-memory, use Redis for production)
let otpStore = {};

// Check if email configuration is available
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env file');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  // Check if email configuration is available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration not set. Please configure EMAIL_USER and EMAIL_PASS in .env file');
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'RaktSetu - Email Verification Code',
    html: `<p>Your verification code is <b>${otp}</b>. It will expire in 60 seconds.</p>`,
  };
  await transporter.sendMail(mailOptions);
};

// Request OTP
router.post('/request-otp', async (req, res) => {
  const { email, userData, role } = req.body;
  
  try {
    // Check for existing email first
    let existingUser;
    if (role === 'donor') {
      existingUser = await Donor.findOne({ email });
    } else if (role === 'hospital') {
      existingUser = await Hospital.findOne({ email });
      
      // For hospitals, also check for duplicate license number
      if (!existingUser && userData && userData.licenseNumber) {
        const existingLicense = await Hospital.findOne({ licenseNumber: userData.licenseNumber });
        if (existingLicense) {
          console.log('Duplicate license number detected:', userData.licenseNumber);
          return res.status(400).json({ 
            message: 'This license number is already registered', 
            error: 'E11000 duplicate key error: licenseNumber already exists' 
          });
        }
      }
    }
    
    if (existingUser) {
      console.log('Duplicate email detected:', email);
      return res.status(400).json({ 
        message: 'This email is already registered', 
        error: 'E11000 duplicate key error: email already exists' 
      });
    }
    
    // Generate and store OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { 
      code: otp, 
      expiresAt: Date.now() + 60000,
      userData,
      role
    };
    
    console.log('Generated OTP for:', email, 'OTP:', otp);
    await sendOTPEmail(email, otp);
    console.log('OTP email sent to:', email);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error in OTP request process:', err);
    res.status(500).json({ message: 'Error processing OTP request', error: err.message });
  }
});

// Verify OTP and register user
router.post('/verify-otp', async (req, res) => {
  const { email, code, userData, role } = req.body;
  
  console.log('Verifying OTP for:', email, 'Provided OTP:', code);
  console.log('OTP Store:', JSON.stringify(otpStore));
  
  const otpData = otpStore[email];
  if (!otpData || Date.now() > otpData.expiresAt) {
    return res.status(400).json({ message: 'OTP expired' });
  }
  if (otpData.code !== code) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
  
  console.log('OTP verified successfully for:', email);
  try {
    let newUser, token;
    // Use role from otpData if not provided in request
    const userRole = role || otpData.role;
    const userDataToUse = userData || otpData.userData;
    
    if (!userRole || !userDataToUse) {
      return res.status(400).json({ message: 'Missing user data or role information' });
    }
    
    if (userRole === 'donor') {
      const { password, ...otherData } = userDataToUse;
      const hashedPassword = await bcrypt.hash(password, 10);
      newUser = new Donor({ ...otherData, password: hashedPassword });
      await newUser.save();
      token = jwt.sign({ userId: newUser._id, role: 'donor' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    } else if (userRole === 'hospital') {
      const { password, ...otherData } = userDataToUse;
      const hashedPassword = await bcrypt.hash(password, 10);
      newUser = new Hospital({ ...otherData, password: hashedPassword, isVerified: false });
      await newUser.save();
      token = jwt.sign({ userId: newUser._id, role: 'hospital' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    } else {
      return res.status(400).json({ message: 'Invalid role for OTP registration' });
    }
    delete otpStore[email];
    console.log('User registered successfully:', { email, role: userRole, userId: newUser._id });
    res.status(200).json({ message: 'User verified and registered successfully', user: newUser, token });
  } catch (err) {
    console.error('Error during OTP verification:', err);
    
    // Check for duplicate key error (MongoDB error code 11000)
    if (err.code === 11000) {
      // Check which field caused the duplicate key error
      const field = Object.keys(err.keyPattern)[0];
      console.log(`Duplicate key error for field: ${field}`);
      
      let errorMessage = `Error registering user: Duplicate ${field}`;
      if (field === 'licenseNumber') {
        errorMessage = 'This license number is already registered';
      } else if (field === 'email') {
        errorMessage = 'This email is already registered';
      }
      
      return res.status(400).json({ 
        message: errorMessage, 
        error: `E11000 duplicate key error: ${field} already exists` 
      });
    }
    
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
});

// Register Admin (This should be used only once to create the first admin)
router.post('/register/admin', async (req, res) => {
    try {
        // Check if admin already exists
        const adminExists = await Admin.findOne({});
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const admin = new Admin(req.body);
        await admin.save();
        // Create history record for registration
        await History.create({
            userId: admin._id,
            userType: 'Admin',
            action: 'register',
            details: { email: admin.email },
            date: new Date()
        });
        const token = jwt.sign(
            { userId: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.status(201).json({ admin, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Register Donor
router.post('/register/donor', async (req, res) => {
    try {
        const { password, ...otherData } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        // Validate age
        if (otherData.age < 18 || otherData.age > 65) {
            return res.status(400).json({ message: 'Age must be between 18 and 65 years' });
        }
        // Validate gender
        if (!['Male', 'Female', 'Other'].includes(otherData.gender)) {
            return res.status(400).json({ message: 'Invalid gender value' });
        }
        const donor = new Donor({
            ...otherData,
            password: hashedPassword
        });
        await donor.save();
        // Create history record for registration
        await History.create({
            userId: donor._id,
            userType: 'Donor',
            action: 'register',
            details: { email: donor.email },
            date: new Date()
        });
        const token = jwt.sign(
            { userId: donor._id, role: 'donor' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.status(201).json({ donor, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Register Hospital
router.post('/register/hospital', async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password, 
            phone, 
            city, 
            state, 
            contactPerson, 
            licenseNumber 
        } = req.body;
        console.log('Registration attempt:', {
            email,
            passwordLength: password?.length
        });
        // Validate required fields
        const missingFields = [];
        if (!name) missingFields.push('name');
        if (!email) missingFields.push('email');
        if (!password) missingFields.push('password');
        if (!phone) missingFields.push('phone');
        if (!city) missingFields.push('city');
        if (!state) missingFields.push('state');
        if (!contactPerson) missingFields.push('contact person');
        if (!licenseNumber) missingFields.push('license number');
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        // Check if email already exists
        const existingHospital = await Hospital.findOne({ email: email.toLowerCase() });
        if (existingHospital) {
            return res.status(400).json({ 
                message: 'Email already registered'
            });
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('Password hashed during registration');
        // Create new hospital instance
        const hospital = new Hospital({
            name,
            email: email.toLowerCase(),
            password: hashedPassword, // Use the hashed password
            phone,
            city,
            state,
            contactPerson: contactPerson.trim(),
            licenseNumber,
            isVerified: false
        });
        // Save to database
        await hospital.save();
        // Create history record for registration
        await History.create({
            userId: hospital._id,
            userType: 'Hospital',
            action: 'register',
            details: { email: hospital.email },
            date: new Date()
        });
        console.log('Hospital saved with hashed password');
        // Generate token
        const token = jwt.sign(
            { userId: hospital._id, role: 'hospital' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.status(201).json({ 
            message: 'Hospital registration successful. Waiting for admin verification.',
            hospital: {
                id: hospital._id,
                name: hospital.name,
                email: hospital.email,
                isVerified: hospital.isVerified
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ 
            message: error.message || 'Registration failed'
        });
    }
});

// Login Admin
router.post('/login/admin', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Normalize email to lowercase and trim spaces
        const normalizedEmail = email.trim().toLowerCase();
        const admin = await Admin.findOne({ email: normalizedEmail });
        
        if (!admin || !(await bcrypt.compare(password, admin.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Update lastLogin
        admin.lastLogin = new Date();
        await admin.save();
        // Create history record
        await History.create({
            userId: admin._id,
            userType: 'Admin',
            action: 'login',
            details: { email: admin.email },
            date: new Date()
        });
        
        const token = jwt.sign(
            { userId: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: 'admin',
                isVerified: true
            },
            token 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login Donor
router.post('/login/donor', async (req, res) => {
    try {
        const { email, password } = req.body;
        const donor = await Donor.findOne({ email });
        
        if (!donor || !(await bcrypt.compare(password, donor.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Update lastLogin
        donor.lastLogin = new Date();
        await donor.save();
        // Create history record
        await History.create({
            userId: donor._id,
            userType: 'Donor',
            action: 'login',
            details: { email: donor.email },
            date: new Date()
        });
        
        const token = jwt.sign(
            { userId: donor._id, role: 'donor' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ donor, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login Hospital
router.post('/login/hospital', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('Login attempt:', { email, passwordLength: password?.length });
        
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }

        // Find hospital
        const hospital = await Hospital.findOne({ email: email.toLowerCase() });
        
        if (!hospital) {
            console.log('No hospital found with email:', email);
            return res.status(401).json({ 
                message: 'Invalid credentials'
            });
        }

        console.log('Found hospital:', {
            id: hospital._id,
            email: hospital.email,
            hasPassword: !!hospital.password,
            passwordPrefix: hospital.password?.substring(0, 10)
        });

        // Compare passwords
        const isValidPassword = await hospital.comparePassword(password);
        console.log('Password validation result:', isValidPassword);
        
        if (!isValidPassword) {
            return res.status(401).json({ 
                message: 'Invalid credentials'
            });
        }
        
        // Check if hospital is verified
        if (!hospital.isVerified) {
            return res.status(401).json({ 
                message: 'Your account is pending admin verification. Please wait for approval.'
            });
        }
        // Update lastLogin
        hospital.lastLogin = new Date();
        await hospital.save();
        // Create history record
        await History.create({
            userId: hospital._id,
            userType: 'Hospital',
            action: 'login',
            details: { email: hospital.email },
            date: new Date()
        });
        // Generate token
        const token = jwt.sign(
            { userId: hospital._id, role: 'hospital' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            hospital: {
                id: hospital._id,
                name: hospital.name,
                email: hospital.email,
                licenseNumber: hospital.licenseNumber,
                isVerified: hospital.isVerified,
                phone: hospital.phone,
                city: hospital.city,
                state: hospital.state,
                contactPerson: hospital.contactPerson,
                requestsMade: hospital.requestsMade,
                requestsCompleted: hospital.requestsCompleted,
                createdAt: hospital.createdAt
            }, 
            token,
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Hospital login error:', error);
        res.status(400).json({ 
            message: error.message || 'Login failed'
        });
    }
});

// Reset Hospital Password
router.post('/reset-password/hospital', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        
        if (!email || !newPassword) {
            return res.status(400).json({ 
                message: 'Email and new password are required' 
            });
        }

        // Convert email to lowercase for case-insensitive comparison
        const normalizedEmail = email.toLowerCase();
        
        // Find hospital
        const hospital = await Hospital.findOne({ email: normalizedEmail });
        
        if (!hospital) {
            return res.status(404).json({ 
                message: 'No hospital found with this email' 
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        hospital.password = hashedPassword;
        await hospital.save();
        
        res.json({ 
            message: 'Password reset successful',
            hospital: {
                id: hospital._id,
                email: hospital.email,
                name: hospital.name
            }
        });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(400).json({ 
            message: error.message || 'Password reset failed'
        });
    }
});

// Forgot Password: Request Reset OTP
router.post('/request-reset-otp', async (req, res) => {
  const { email, role } = req.body;
  let user = null;
  if (role === 'donor') {
    user = await Donor.findOne({ email });
  } else if (role === 'hospital') {
    user = await Hospital.findOne({ email });
  } else {
    return res.status(400).json({ message: 'Invalid role' });
  }
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  // Mask email for response
  const [name, domain] = email.split('@');
  const maskedName = name.length <= 2 ? '*'.repeat(name.length) : name[0] + '*'.repeat(name.length-2) + name[name.length-1];
  const maskedEmail = maskedName + '@' + domain;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { code: otp, expiresAt: Date.now() + 60000, forReset: true };
  try {
    await sendOTPEmail(email, otp);
    res.status(200).json({ message: 'OTP sent successfully', maskedEmail });
  } catch (err) {
    res.status(500).json({ message: 'Error sending OTP', error: err });
  }
});

// Forgot Password: Verify Reset OTP
router.post('/verify-reset-otp', async (req, res) => {
  const { email, code } = req.body;
  const otpData = otpStore[email];
  if (!otpData || !otpData.forReset || Date.now() > otpData.expiresAt) {
    return res.status(400).json({ message: 'OTP expired' });
  }
  if (otpData.code !== code) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }
  res.status(200).json({ message: 'OTP verified' });
});

// Forgot Password: Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, role, newPassword } = req.body;
  const otpData = otpStore[email];
  if (!otpData || !otpData.forReset) {
    return res.status(400).json({ message: 'OTP verification required' });
  }
  let user = null;
  if (role === 'donor') {
    user = await Donor.findOne({ email });
  } else if (role === 'hospital') {
    user = await Hospital.findOne({ email });
  } else {
    return res.status(400).json({ message: 'Invalid role' });
  }
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  delete otpStore[email];
  res.status(200).json({ message: 'Password reset successful' });
});

// Add logout endpoint for all user types
router.post('/logout', auth, async (req, res) => {
    try {
        let userType = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);
        await History.create({
            userId: req.user.userId,
            userType,
            action: 'logout',
            details: { email: req.user.email },
            date: new Date()
        });
        res.json({ message: 'Logout recorded in history.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
    try {
        let user;
        if (req.user.role === 'donor') {
            user = await Donor.findById(req.user.userId);
        } else if (req.user.role === 'hospital') {
            user = await Hospital.findById(req.user.userId);
        } else if (req.user.role === 'admin') {
            user = await Admin.findById(req.user.userId);
        }
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;