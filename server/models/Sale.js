const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  totalPKR: { type: Number, required: true },
  profitPKR: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', saleSchema);
