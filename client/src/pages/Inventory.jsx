import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Package } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Sliding Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Form States
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [costPricePKR, setCostPricePKR] = useState(0);
  const [sellingPricePKR, setSellingPricePKR] = useState(0);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const location = useLocation();

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
    if (location.state && location.state.openAddDrawer) {
      handleOpenAdd();
      // Clear location state safely
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await axios.delete(`${API_URL}/api/products/${id}`);
      fetchProducts();
    }
  };

  const handleOpenAdd = () => {
    setSku('');
    setName('');
    setCategory('');
    setQuantity(0);
    setCostPricePKR(0);
    setSellingPricePKR(0);
    setFormError('');
    setIsEditing(false);
    setSelectedProductId(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSku(product.sku);
    setName(product.name);
    setCategory(product.category || '');
    setQuantity(product.quantity);
    setCostPricePKR(product.costPricePKR);
    setSellingPricePKR(product.sellingPricePKR);
    setFormError('');
    setIsEditing(true);
    setSelectedProductId(product._id);
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validations
    if (!sku.trim() || !name.trim() || !category.trim()) {
      setFormError('All text fields are required.');
      return;
    }

    if (quantity < 0 || costPricePKR < 0 || sellingPricePKR < 0) {
      setFormError('Numeric values must be greater than or equal to 0.');
      return;
    }

    setSubmitting(true);
    const payload = {
      sku: sku.trim(),
      name: name.trim(),
      category: category.trim(),
      quantity: Number(quantity),
      costPricePKR: Number(costPricePKR),
      sellingPricePKR: Number(sellingPricePKR),
    };

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/api/products/${selectedProductId}`, payload);
      } else {
        await axios.post(`${API_URL}/api/products`, payload);
      }
      setIsDrawerOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      if (err.response?.data?.message) {
        const msg = err.response.data.message;
        if (msg.includes('E11000') || msg.includes('duplicate key')) {
          setFormError('Duplicate SKU Error: This SKU code is already registered to another product. Please use a unique SKU!');
        } else {
          setFormError(msg);
        }
      } else if (err.message) {
        if (err.message.includes('Network Error')) {
          setFormError('Network Error: Unable to reach the backend server. Please ensure the backend server is online or your local server is running!');
        } else {
          setFormError(`Save failed: ${err.message}`);
        }
      } else {
        setFormError('An unexpected error occurred while saving the product.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 relative min-h-screen">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Inventory Management</h1>
        <button 
          onClick={handleOpenAdd}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </header>

      <div className="glass-panel p-6 rounded-2xl border border-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
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
          <div className="text-center py-12 text-gray-400">Loading catalogue ledger...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-gray-400 text-sm">
                  <th className="py-4 font-semibold">SKU</th>
                  <th className="py-4 font-semibold">Product Name</th>
                  <th className="py-4 font-semibold">Category</th>
                  <th className="py-4 font-semibold text-right">Quantity</th>
                  <th className="py-4 font-semibold text-right">Cost (PKR)</th>
                  <th className="py-4 font-semibold text-right">Price (PKR)</th>
                  <th className="py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="border-b border-border/40 hover:bg-surfaceHover transition-colors">
                    <td className="py-4 text-gray-300 font-mono text-sm">{product.sku}</td>
                    <td className="py-4 font-medium text-white">{product.name}</td>
                    <td className="py-4 text-gray-400 text-sm">{product.category || '-'}</td>
                    <td className="py-4 text-right">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${product.quantity < 10 ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="py-4 text-right text-gray-300 text-sm">{product.costPricePKR.toLocaleString()}</td>
                    <td className="py-4 text-right text-white font-semibold text-sm">{product.sellingPricePKR.toLocaleString()}</td>
                    <td className="py-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button 
                          onClick={() => handleOpenEdit(product)}
                          className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product._id)} 
                          className="p-2 hover:bg-danger/10 text-danger rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-500">No products active in catalog.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sliding Glassmorphism Side Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Dark Overlay backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Sliding Drawer Container */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-background/95 backdrop-blur-xl border-l border-border z-50 p-6 shadow-2xl flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-center pb-6 border-b border-border mb-6">
                  <div className="flex items-center gap-2">
                    <Package className="text-primary w-5 h-5" />
                    <h2 className="text-xl font-bold text-white">
                      {isEditing ? 'Edit Catalogue Item' : 'Register New Item'}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1 hover:bg-surfaceHover text-gray-400 hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3 text-xs bg-danger/10 border border-danger/25 text-danger rounded-xl font-medium">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Item SKU Code</label>
                    <input 
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. ELEC-LAP-001"
                      className="input-field rounded-xl"
                      disabled={isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Product Name</label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Macbook Pro 16"
                      className="input-field rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                    <input 
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Electronics"
                      className="input-field rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Stock Quantity</label>
                      <input 
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(0, e.target.value))}
                        className="input-field rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cost Price (PKR)</label>
                      <input 
                        type="number"
                        value={costPricePKR}
                        onChange={(e) => setCostPricePKR(Math.max(0, e.target.value))}
                        className="input-field rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Selling Price (PKR)</label>
                    <input 
                      type="number"
                      value={sellingPricePKR}
                      onChange={(e) => setSellingPricePKR(Math.max(0, e.target.value))}
                      className="input-field rounded-xl"
                    />
                  </div>

                  {/* Submission triggers */}
                  <div className="pt-6 flex gap-3 border-t border-border mt-8">
                    <button 
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex-1 px-4 py-3 bg-surfaceHover border border-border hover:bg-gray-800/80 text-white rounded-xl font-semibold text-sm transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primaryHover hover:to-purple-700 text-white py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                    >
                      {submitting ? 'Saving Item...' : isEditing ? 'Update Item' : 'Register Item'}
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
