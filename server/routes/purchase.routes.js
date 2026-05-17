const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const purchases = await Purchase.find().populate('supplierId').populate('items.productId').sort({ date: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { supplierId, totalPKR, items } = req.body;
    const purchase = new Purchase({ supplierId, totalPKR, items });
    await purchase.save();
    
    // Update product quantities
    for (let item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { quantity: item.quantity } });
    }
    
    res.status(201).json(purchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
