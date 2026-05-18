const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  if (global.useVirtualDB) {
    return res.json(global.virtualPurchases || []);
  }
  try {
    const purchases = await Purchase.find().populate('supplierId').populate('items.productId').sort({ date: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  if (global.useVirtualDB) {
    const { supplierId, totalPKR, items } = req.body;
    
    // Map items to include their product objects
    const resolvedItems = items.map(item => {
      const pIdx = global.virtualProducts.findIndex(p => p._id === item.productId);
      if (pIdx !== -1) {
        // Increase quantity in memory
        global.virtualProducts[pIdx].quantity = Number(global.virtualProducts[pIdx].quantity) + Number(item.quantity);
        return {
          productId: global.virtualProducts[pIdx],
          quantity: item.quantity,
          costPricePKR: item.costPricePKR
        };
      }
      return item;
    });

    const virtualPurchase = {
      supplierId,
      totalPKR,
      items: resolvedItems,
      date: new Date(),
      _id: `v-purch-${Date.now()}`
    };
    
    global.virtualPurchases = global.virtualPurchases || [];
    global.virtualPurchases.unshift(virtualPurchase);
    return res.status(201).json(virtualPurchase);
  }
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
