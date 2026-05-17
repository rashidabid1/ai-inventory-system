const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

const seedData = [
  { name: 'Wireless Mouse', sku: 'WM-001', quantity: 50, costPricePKR: 1800, sellingPricePKR: 2500, category: 'Accessories' },
  { name: 'Mechanical Keyboard', sku: 'MK-002', quantity: 30, costPricePKR: 6000, sellingPricePKR: 8500, category: 'Peripherals' },
  { name: 'Gaming Headset', sku: 'GH-003', quantity: 25, costPricePKR: 5000, sellingPricePKR: 7200, category: 'Audio' },
  { name: 'Fast Charger 25W', sku: 'FC-004', quantity: 100, costPricePKR: 1100, sellingPricePKR: 1800, category: 'Accessories' },
  { name: 'RTX 4060 GPU', sku: 'GPU-005', quantity: 5, costPricePKR: 95000, sellingPricePKR: 118000, category: 'Components' },
  { name: 'Office Chair', sku: 'OC-006', quantity: 12, costPricePKR: 12000, sellingPricePKR: 16500, category: 'Furniture' }
];

const seedDB = async () => {
  try {
    await connectDB();
    await Product.deleteMany(); // Clear existing products
    await Product.insertMany(seedData);
    console.log('Database Seeded Successfully with PKR items!');
    process.exit();
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
