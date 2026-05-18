const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  console.log('DNS servers configured globally to [8.8.8.8, 1.1.1.1] for robust MongoDB SRV resolution.');
} catch (err) {
  console.warn('Failed to set custom DNS servers:', err.message);
}

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const Product = require('./models/Product');


// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Seed function for in-memory DB
const seedData = [
  { name: 'Wireless Mouse', sku: 'WM-001', quantity: 50, costPricePKR: 1800, sellingPricePKR: 2500, category: 'Accessories' },
  { name: 'Mechanical Keyboard', sku: 'MK-002', quantity: 30, costPricePKR: 6000, sellingPricePKR: 8500, category: 'Peripherals' },
  { name: 'Gaming Headset', sku: 'GH-003', quantity: 25, costPricePKR: 5000, sellingPricePKR: 7200, category: 'Audio' },
  { name: 'Fast Charger 25W', sku: 'FC-004', quantity: 100, costPricePKR: 1100, sellingPricePKR: 1800, category: 'Accessories' },
  { name: 'RTX 4060 GPU', sku: 'GPU-005', quantity: 5, costPricePKR: 95000, sellingPricePKR: 118000, category: 'Components' },
  { name: 'Office Chair', sku: 'OC-006', quantity: 12, costPricePKR: 12000, sellingPricePKR: 16500, category: 'Furniture' },
  { name: 'Smart Watch Ultra', sku: 'SW-007', quantity: 15, costPricePKR: 12000, sellingPricePKR: 18500, category: 'Electronics' },
  { name: 'Noise Cancelling Earbuds', sku: 'EB-008', quantity: 40, costPricePKR: 8500, sellingPricePKR: 12900, category: 'Electronics' },
  { name: 'USB-C Hub 8-in-1', sku: 'HB-009', quantity: 60, costPricePKR: 3500, sellingPricePKR: 5200, category: 'Electronics' },
  { name: 'Curved Gaming Monitor 27"', sku: 'MN-010', quantity: 8, costPricePKR: 45000, sellingPricePKR: 58900, category: 'Electronics' }
];

// Initialize global virtual memory store collections as robust runtime fallbacks
global.virtualProducts = seedData.map((item, idx) => ({
  ...item,
  _id: `v-prod-${idx + 1}`
}));
global.virtualSales = [];
global.virtualPurchases = [];

const seedDatabase = async () => {
  try {
    if (global.useVirtualDB) {
      console.log('Using Virtual In-Memory Fallback Database.');
      return;
    }
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(seedData);
      console.log('In-Memory Database Seeded Automatically!');
    }
  } catch (error) {
    console.error('Error during database seeding, falling back to virtual database:', error.message);
    global.useVirtualDB = true;
  }
};

// Connect to database and seed
connectDB().then(() => {
  seedDatabase();
}).catch((err) => {
  console.error('Failed to connect to Mongoose, running on virtual memory database:', err.message);
  global.useVirtualDB = true;
});

// Routes
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/sales', require('./routes/sale.routes'));
app.use('/api/purchases', require('./routes/purchase.routes'));
app.use('/api/suppliers', require('./routes/supplier.routes'));
app.use('/api/customers', require('./routes/customer.routes'));
app.use('/api/ai', require('./routes/ai.routes'));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('AI Inventory API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
