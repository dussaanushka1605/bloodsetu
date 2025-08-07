const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'userType' },
  userType: { type: String, enum: ['Donor', 'Hospital', 'Admin'], required: true },
  action: { type: String, required: true }, // e.g., 'login', 'donation', 'request'
  details: { type: Object },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', HistorySchema); 