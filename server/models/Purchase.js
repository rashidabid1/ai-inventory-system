const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  totalPKR: { type: Number, required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    costPricePKR: Number
  }],
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', purchaseSchema);
