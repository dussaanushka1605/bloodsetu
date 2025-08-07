const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Donor = require('./models/Donor');
const Hospital = require('./models/Hospital');
const Admin = require('./models/Admin');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Successfully connected to MongoDB');
        
        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nCollections in database:');
        collections.forEach(collection => {
            console.log(`- ${collection.name}`);
        });
        
        // Verify models
        console.log('\nVerifying models...');
        
        // Check Donor model
        const donorSchema = Donor.schema;
        console.log('\nDonor Schema Fields:');
        Object.keys(donorSchema.paths).forEach(field => {
            console.log(`- ${field}: ${donorSchema.paths[field].instance}`);
        });
        
        // Check Hospital model
        const hospitalSchema = Hospital.schema;
        console.log('\nHospital Schema Fields:');
        Object.keys(hospitalSchema.paths).forEach(field => {
            console.log(`- ${field}: ${hospitalSchema.paths[field].instance}`);
        });
        
        // Check Admin model
        const adminSchema = Admin.schema;
        console.log('\nAdmin Schema Fields:');
        Object.keys(adminSchema.paths).forEach(field => {
            console.log(`- ${field}: ${adminSchema.paths[field].instance}`);
        });
        
        console.log('\n✅ Database schema verification completed');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('\nConnection closed');
    }
}

// Run the test
testConnection(); 