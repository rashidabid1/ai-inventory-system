import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/purchases`);
        setPurchases(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Purchase Orders</h1>
      </header>

      <div className="glass-panel p-6 rounded-2xl">
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-gray-400">
                  <th className="py-4 font-medium">Date</th>
                  <th className="py-4 font-medium">Supplier</th>
                  <th className="py-4 font-medium">Items Count</th>
                  <th className="py-4 font-medium text-right">Total (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase._id} className="border-b border-border/50 hover:bg-surfaceHover transition-colors">
                    <td className="py-4 text-gray-300 text-sm">{new Date(purchase.date).toLocaleString()}</td>
                    <td className="py-4 font-medium text-white">{purchase.supplierId?.name || 'N/A'}</td>
                    <td className="py-4 text-gray-300">{purchase.items.length}</td>
                    <td className="py-4 text-right text-danger font-medium">-{purchase.totalPKR.toLocaleString()}</td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-400">No purchases recorded yet.</td>
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
