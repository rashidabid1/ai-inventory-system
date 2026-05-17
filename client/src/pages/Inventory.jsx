import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await axios.delete(`${API_URL}/api/products/${id}`);
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
        <button className="btn-primary">
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </header>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name or SKU..." 
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-gray-400">
                  <th className="py-4 font-medium">SKU</th>
                  <th className="py-4 font-medium">Product Name</th>
                  <th className="py-4 font-medium">Category</th>
                  <th className="py-4 font-medium text-right">Quantity</th>
                  <th className="py-4 font-medium text-right">Cost (PKR)</th>
                  <th className="py-4 font-medium text-right">Price (PKR)</th>
                  <th className="py-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-border/50 hover:bg-surfaceHover transition-colors">
                    <td className="py-4 text-gray-300 font-mono text-sm">{product.sku}</td>
                    <td className="py-4 font-medium text-white">{product.name}</td>
                    <td className="py-4 text-gray-400">{product.category || '-'}</td>
                    <td className="py-4 text-right">
                      <span className={`px-2 py-1 rounded-md text-sm font-medium ${product.quantity < 10 ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="py-4 text-right text-gray-300">{product.costPricePKR.toLocaleString()}</td>
                    <td className="py-4 text-right text-white font-medium">{product.sellingPricePKR.toLocaleString()}</td>
                    <td className="py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 hover:bg-primary/20 text-primary rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="p-2 hover:bg-danger/20 text-danger rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-400">No products found.</td>
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
