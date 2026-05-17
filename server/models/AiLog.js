const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema({
  query: { type: String, required: true },
  response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AiLog', aiLogSchema);
