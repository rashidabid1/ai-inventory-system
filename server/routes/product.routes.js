const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  if (global.useVirtualDB) {
    return res.json(global.virtualProducts || []);
  }
  try {
    const products = await Product.find().populate('supplierId');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a product
router.post('/', async (req, res) => {
  if (global.useVirtualDB) {
    const virtualProduct = {
      ...req.body,
      _id: `v-prod-${Date.now()}`
    };
    global.virtualProducts = global.virtualProducts || [];
    global.virtualProducts.push(virtualProduct);
    return res.status(201).json(virtualProduct);
  }
  const product = new Product(req.body);
  try {
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a product
router.put('/:id', async (req, res) => {
  if (global.useVirtualDB) {
    const idx = global.virtualProducts.findIndex(p => p._id === req.params.id);
    if (idx !== -1) {
      global.virtualProducts[idx] = {
        ...global.virtualProducts[idx],
        ...req.body
      };
      return res.json(global.virtualProducts[idx]);
    }
    return res.status(404).json({ message: 'Product not found in virtual database' });
  }
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  if (global.useVirtualDB) {
    const initialLen = global.virtualProducts.length;
    global.virtualProducts = global.virtualProducts.filter(p => p._id !== req.params.id);
    if (global.virtualProducts.length < initialLen) {
      return res.json({ message: 'Product deleted' });
    }
    return res.status(404).json({ message: 'Product not found in virtual database' });
  }
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
