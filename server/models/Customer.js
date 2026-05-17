const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  purchaseHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sale' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', customerSchema);
