const { GoogleGenAI } = require('@google/genai');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// Initialize Gemini Client safely
let ai = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('Gemini AI client initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err.message);
  }
}

// ─── Greeting detection (backend safety net) ──────────────────────────────────
const GREETING_PATTERNS = [
  /^\s*(hi|hello|hey|hiya|howdy|sup|yo)\b/i,
  /^\s*good\s*(morning|afternoon|evening|night)\b/i,
  /^\s*(as)?salaam(u\s*alaikum)?\s*$/i,
  /^\s*salam\b/i,
  /^\s*wa\s*alaikum/i,
  /^\s*aoa\s*$/i,
];

const GREETING_RESPONSES = [
  "Hello! 👋 How can I assist you with your inventory today?",
  "Hey there! 😊 What would you like to know about your stock?",
  "Welcome back! 🚀 I'm ready to help. Ask me anything about your inventory.",
  "Hi! 👋 Need help finding products, checking stock levels, or analyzing your inventory?",
  "Hello! How can I help you manage your inventory today? 😊",
];

function isGreeting(text) {
  return GREETING_PATTERNS.some(r => r.test(text.trim()));
}

function randomGreeting() {
  return GREETING_RESPONSES[Math.floor(Math.random() * GREETING_RESPONSES.length)];
}

// ─── Fallback local response when Gemini key is missing ──────────────────────
const processMockQuery = (query, products, sales, totalInventoryValue, lowStockItems) => {
  const lower = query.toLowerCase();

  // List all products
  if (/\b(show|list|all|view|display)\b.*\b(product|item|stock|inventory)\b/i.test(query)
    || /\b(available\s*stock|inventory)\b/i.test(query)) {
    let table = `| # | Product Name | Category | Qty | Cost (PKR) | Sell Price (PKR) | Status |\n|:--|:-------------|:---------|:---:|:----------:|:----------------:|:------:|\n`;
    products.forEach((p, i) => {
      const status = p.quantity < 10 ? '🔴 Low' : '🟢 OK';
      table += `| ${i + 1} | ${p.name} | ${p.category || '—'} | ${p.quantity} | ${(p.costPricePKR || 0).toLocaleString()} | ${(p.sellingPricePKR || 0).toLocaleString()} | ${status} |\n`;
    });
    return `### 📦 Current Inventory Catalogue\n\n${table}\n**Total:** ${products.length} products · **Asset Value:** PKR ${totalInventoryValue.toLocaleString()} · **Low Stock:** ${lowStockItems.length} items`;
  }

  // Low stock
  if (/\b(low\s*stock|running\s*low|reorder|critical)\b/i.test(query)) {
    if (lowStockItems.length === 0) {
      return '### ✅ All Stock Levels Optimal\n\nNo products are currently running low. All items are above the minimum threshold of 10 units.';
    }
    let table = `| Product Name | Category | Qty | Sell Price (PKR) |\n|:-------------|:---------|:---:|:----------------:|\n`;
    lowStockItems.forEach(p => {
      table += `| ${p.name} | ${p.category || '—'} | ${p.quantity} | ${(p.sellingPricePKR || 0).toLocaleString()} |\n`;
    });
    return `### 🔴 Low Stock Alert — ${lowStockItems.length} Item${lowStockItems.length > 1 ? 's' : ''} Need Reordering\n\n${table}\n⚠️ Consider placing purchase orders for these items immediately to prevent stockouts.`;
  }

  // Summary / financial
  if (/\b(summary|metrics|financial|revenue|profit|value|cost)\b/i.test(query)) {
    const projectedRev = products.reduce((acc, p) => acc + (p.quantity * (p.sellingPricePKR || 0)), 0);
    const projectedProfit = products.reduce((acc, p) => acc + (p.quantity * ((p.sellingPricePKR || 0) - (p.costPricePKR || 0))), 0);
    const totalSalesRev = sales.reduce((acc, s) => acc + (s.totalPKR || 0), 0);
    const totalSalesProfit = sales.reduce((acc, s) => acc + (s.profitPKR || 0), 0);

    return `### 📈 Financial & Inventory Summary

| Metric | Value |
|:-------|------:|
| 📦 Total Products | ${products.length} |
| 🔢 Total Units in Stock | ${products.reduce((a, p) => a + p.quantity, 0)} |
| 💰 Total Asset Value (cost) | PKR ${totalInventoryValue.toLocaleString()} |
| 💵 Projected Revenue (if sold) | PKR ${projectedRev.toLocaleString()} |
| 🔥 Projected Profit Margin | PKR ${projectedProfit.toLocaleString()} |
| 🛒 Actual Sales Revenue | PKR ${totalSalesRev.toLocaleString()} |
| ✅ Actual Sales Profit | PKR ${totalSalesProfit.toLocaleString()} |
| ⚠️ Low Stock Items | ${lowStockItems.length} |`;
  }

  // Search
  const searchMatch = query.match(/(?:find|search|look\s*for|do\s*you\s*have|where\s*is)\s+(.+)/i);
  if (searchMatch) {
    const term = searchMatch[1].trim().toLowerCase();
    const found = products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.category || '').toLowerCase().includes(term) ||
      (p.sku || '').toLowerCase().includes(term)
    );
    if (found.length === 0) {
      return `### 🔍 Search Results for "${searchMatch[1]}"\n\nNo products found matching **"${searchMatch[1]}"**. Try searching by a different name or category.`;
    }
    let table = `| Product Name | Category | Qty | Sell Price (PKR) | Status |\n|:-------------|:---------|:---:|:----------------:|:------:|\n`;
    found.forEach(p => {
      table += `| ${p.name} | ${p.category || '—'} | ${p.quantity} | ${(p.sellingPricePKR || 0).toLocaleString()} | ${p.quantity < 10 ? '🔴 Low' : '🟢 OK'} |\n`;
    });
    return `### 🔍 Search Results for "${searchMatch[1]}"\n\nFound **${found.length}** matching product${found.length > 1 ? 's' : ''}:\n\n${table}`;
  }

  // Default
  return `### 🤖 AI Inventory Assistant\n\nThank you for your question: *"${query}"*\n\nHere is a quick overview of your system:\n\n- **Total Products:** ${products.length}\n- **Total Units:** ${products.reduce((a, p) => a + p.quantity, 0)}\n- **Low Stock Alerts:** ${lowStockItems.length}\n- **Asset Value:** PKR ${totalInventoryValue.toLocaleString()}\n\n*Try asking: "Show all products", "Low stock items", "Find [product name]", or "Financial summary"*`;
};

// ─── Main query processor ─────────────────────────────────────────────────────
const processQuery = async (query) => {
  try {
    // Backend-level greeting safety net (frontend handles most, but just in case)
    if (isGreeting(query)) {
      return randomGreeting();
    }

    // 1. Fetch current database state
    let products = [];
    let sales = [];

    if (global.useVirtualDB) {
      products = global.virtualProducts || [];
      sales = global.virtualSales || [];
    } else {
      try {
        products = await Product.find().lean();
        sales = await Sale.find().lean().sort({ date: -1 }).limit(100);
      } catch (dbErr) {
        console.error('Failed to query Mongo, using virtual DB instead:', dbErr.message);
        global.useVirtualDB = true;
        products = global.virtualProducts || [];
        sales = global.virtualSales || [];
      }
    }

    const totalInventoryValue = products.reduce((acc, p) => acc + (p.quantity * (p.costPricePKR || 0)), 0);
    const lowStockItems = products.filter(p => p.quantity < 10);

    // 2. If no Gemini key, use local mock engine
    if (!ai) {
      return processMockQuery(query, products, sales, totalInventoryValue, lowStockItems);
    }

    // 3. Build enriched Gemini prompt
    const productData = products.map(p => ({
      name: p.name,
      sku: p.sku,
      category: p.category || 'Uncategorized',
      quantity: p.quantity,
      costPKR: p.costPricePKR,
      sellPKR: p.sellingPricePKR,
      status: p.quantity < 10 ? 'LOW STOCK' : 'IN STOCK'
    }));

    const salesData = sales.slice(0, 20).map(s => ({
      qty: s.quantity,
      totalPKR: s.totalPKR,
      profitPKR: s.profitPKR,
      date: s.date
    }));

    const prompt = `You are a professional AI Inventory Management Assistant for a Pakistani retail business. 
Your responses must be based STRICTLY on the live database data provided below.
All prices are in PKR (Pakistani Rupees).

=== LIVE DATABASE STATE ===
Total Products: ${products.length}
Total Inventory Value (at cost): PKR ${totalInventoryValue.toLocaleString()}
Low Stock Items (Quantity < 10): ${lowStockItems.length}

Products:
${JSON.stringify(productData, null, 2)}

Recent Sales (last 20):
${JSON.stringify(salesData, null, 2)}
=== END DATABASE STATE ===

USER QUERY: ${query}

STRICT RESPONSE RULES:
1. NEVER output raw JSON. Always format data into clean Markdown tables or bullet lists.
2. Tables MUST use this format: | Column | Column | with proper | :--- | alignment rows.
3. All monetary values must use commas: PKR 1,000,000 not PKR 1000000.
4. Keep responses concise and professional. No unnecessary padding.
5. If asked about a specific product, search case-insensitively across name, SKU, and category.
6. If asked for greetings, respond naturally and warmly.
7. If data is not available, say so clearly rather than making things up.
8. Format product tables with columns: Product Name | Category | Quantity | Price (PKR) | Status`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return `❌ **AI Processing Error**\n\nDetails: ${error.message || error.toString()}\n\nPlease try again or check your Gemini API key configuration.`;
  }
};

module.exports = { processQuery };
