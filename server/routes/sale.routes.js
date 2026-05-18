const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Get all sales
router.get('/', async (req, res) => {
  if (global.useVirtualDB) {
    return res.json(global.virtualSales || []);
  }
  try {
    const sales = await Sale.find().populate('productId').sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Record a sale
router.post('/', async (req, res) => {
  if (global.useVirtualDB) {
    const { productId, quantity, totalPKR, profitPKR } = req.body;
    
    // Find virtual product
    const pIdx = global.virtualProducts.findIndex(p => p._id === productId);
    if (pIdx === -1) {
      return res.status(404).json({ message: 'Product not found in virtual database' });
    }
    
    // Decrease quantity
    global.virtualProducts[pIdx].quantity = Math.max(0, global.virtualProducts[pIdx].quantity - quantity);
    
    const virtualSale = {
      productId: global.virtualProducts[pIdx],
      quantity,
      totalPKR,
      profitPKR,
      date: new Date(),
      _id: `v-sale-${Date.now()}`
    };
    
    global.virtualSales = global.virtualSales || [];
    global.virtualSales.unshift(virtualSale);
    return res.status(201).json(virtualSale);
  }
  try {
    const { productId, quantity, totalPKR, profitPKR } = req.body;
    const sale = new Sale({ productId, quantity, totalPKR, profitPKR });
    await sale.save();
    
    // Update product quantity
    await Product.findByIdAndUpdate(productId, { $inc: { quantity: -quantity } });
    
    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
