const BloodCamp = require('../models/BloodCamp');

/**
 * Automatically marks blood camps as complete if they are 24 hours past their scheduled time
 * This function should be called periodically (e.g., via a cron job or on server startup)
 */
async function updateBloodCampStatus() {
  try {
    console.log('Running blood camp status update job...');
    
    // Calculate the date 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    // Find all upcoming blood camps that are scheduled more than 24 hours ago
    const outdatedCamps = await BloodCamp.find({
      status: 'upcoming',
      date: { $lt: twentyFourHoursAgo }
    });
    
    console.log(`Found ${outdatedCamps.length} outdated blood camps to mark as completed`);
    
    // Update all found camps to 'completed' status
    if (outdatedCamps.length > 0) {
      const updatePromises = outdatedCamps.map(camp => {
        console.log(`Marking camp '${camp.title}' (ID: ${camp._id}) as completed`);
        camp.status = 'completed';
        return camp.save();
      });
      
      await Promise.all(updatePromises);
      console.log(`Successfully marked ${outdatedCamps.length} blood camps as completed`);
    }
    
    return {
      success: true,
      updatedCount: outdatedCamps.length
    };
  } catch (error) {
    console.error('Error updating blood camp status:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { updateBloodCampStatus };