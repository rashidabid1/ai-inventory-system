const { GoogleGenAI } = require('@google/genai');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const processQuery = async (query) => {
  try {
    // 1. Fetch current database state to provide as context
    const products = await Product.find().lean();
    const sales = await Sale.find().lean().sort({ date: -1 }).limit(100);

    // Calculate some basic metrics for the AI
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.quantity * p.costPricePKR), 0);
    const lowStockItems = products.filter(p => p.quantity < 10);
    
    // 2. Build the prompt with context
    const prompt = `
You are an expert AI Assistant for an Inventory Management System.
You must answer the user's query based strictly on the current state of the database.
All financial values are in PKR (Pakistani Rupee).

CURRENT DATABASE STATE:
-------------------------
Total Products: ${products.length}
Total Inventory Value: ${totalInventoryValue} PKR
Low Stock Items (Quantity < 10): ${JSON.stringify(lowStockItems.map(p => ({ name: p.name, qty: p.quantity })))}

Raw Products Data:
${JSON.stringify(products.map(p => ({ name: p.name, qty: p.quantity, cost: p.costPricePKR, sell: p.sellingPricePKR })))}

Recent Sales Data:
${JSON.stringify(sales.map(s => ({ qty: s.quantity, profit: s.profitPKR, date: s.date })))}
-------------------------

USER QUERY:
${query}

INSTRUCTIONS:
- If asked about low stock, refer to the "Low Stock Items" list.
- If asked about inventory value, refer to the "Total Inventory Value".
- If asked about dead stock, consider items with 0 sales or very low sales compared to quantity.
- Keep the response professional, concise, and helpful. Use markdown formatting if necessary.
- Do not make up data.
`;

    // 3. Call Gemini
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return `AI Error Details: ${error.message || error.toString()}`;
  }
};

module.exports = {
  processQuery
};
