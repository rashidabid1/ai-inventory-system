const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find().populate('productId').sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Record a sale
router.post('/', async (req, res) => {
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
