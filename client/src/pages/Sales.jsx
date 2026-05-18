import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, Search } from 'lucide-react';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New sale state
  const [showForm, setShowForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    try {
      const [salesRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/api/sales`),
        axios.get(`${API_URL}/api/products`)
      ]);
      setSales(salesRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecordSale = async (e) => {
    e.preventDefault();
    const product = products.find(p => p._id === selectedProductId);
    if (!product) return;

    if (quantity > product.quantity) {
      alert('Insufficient stock!');
      return;
    }

    const totalPKR = quantity * product.sellingPricePKR;
    const costPKR = quantity * product.costPricePKR;
    const profitPKR = totalPKR - costPKR;

    try {
      await axios.post(`${API_URL}/api/sales`, {
        productId: selectedProductId,
        quantity,
        totalPKR,
        profitPKR
      });
      setShowForm(false);
      setSelectedProductId('');
      setQuantity(1);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error recording sale');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Sales Tracker</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-5 h-5" /> Record Sale
        </button>
      </header>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-bold mb-4">New Sale</h2>
          <form onSubmit={handleRecordSale} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-400 mb-1">Product</label>
              <select 
                className="input-field w-full" 
                value={selectedProductId} 
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
              >
                <option value="" disabled>Select Product...</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name} (Stock: {p.quantity}) - {p.sellingPricePKR} PKR</option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-400 mb-1">Quantity</label>
              <input 
                type="number" 
                min="1" 
                className="input-field w-full" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full py-2 px-6 h-[42px]">Submit</button>
          </form>
        </motion.div>
      )}

      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-lg font-semibold mb-4 border-b border-border pb-2">Recent Sales</h3>
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-gray-400">
                  <th className="py-4 font-medium">Date</th>
                  <th className="py-4 font-medium">Product</th>
                  <th className="py-4 font-medium text-right">Qty</th>
                  <th className="py-4 font-medium text-right">Total (PKR)</th>
                  <th className="py-4 font-medium text-right">Profit (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id} className="border-b border-border/50 hover:bg-surfaceHover transition-colors">
                    <td className="py-4 text-gray-300 text-sm">{new Date(sale.date).toLocaleString()}</td>
                    <td className="py-4 font-medium text-white">{sale.productId?.name || 'Unknown'}</td>
                    <td className="py-4 text-right text-gray-300">{sale.quantity}</td>
                    <td className="py-4 text-right text-white font-medium">{sale.totalPKR.toLocaleString()}</td>
                    <td className="py-4 text-right text-success font-medium">+{sale.profitPKR.toLocaleString()}</td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">No sales recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
