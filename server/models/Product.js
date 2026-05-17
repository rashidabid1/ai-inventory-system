const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 },
  costPricePKR: { type: Number, required: true },
  sellingPricePKR: { type: Number, required: true },
  category: { type: String },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  imageUrl: { type: String },
  barcode: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
