const mongoose = require('mongoose');
const BloodCamp = require('../models/BloodCamp');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

async function migrateBloodCamps() {
  try {
    console.log('Starting migration of blood camps...');
    
    // Get all blood camps
    const bloodCamps = await BloodCamp.find({});
    console.log(`Found ${bloodCamps.length} blood camps to migrate`);
    
    let migratedCount = 0;
    
    for (const camp of bloodCamps) {
      // Check if the camp has the old format of interestedDonors (array of ObjectIds)
      const needsMigration = camp.interestedDonors.some(donor => 
        typeof donor === 'string' || donor instanceof mongoose.Types.ObjectId
      );
      
      if (needsMigration) {
        // Convert old format to new format
        const oldDonors = [...camp.interestedDonors];
        camp.interestedDonors = [];
        
        // Add each donor with the new schema format
        for (const donorId of oldDonors) {
          camp.interestedDonors.push({
            donor: donorId,
            status: 'registered',
            registeredAt: new Date()
          });
        }
        
        // Save the updated camp
        await camp.save();
        migratedCount++;
        console.log(`Migrated blood camp: ${camp._id}`);
      }
    }
    
    console.log(`Migration completed. ${migratedCount} blood camps were updated.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

migrateBloodCamps();