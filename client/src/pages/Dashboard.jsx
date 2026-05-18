import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp, AlertCircle, DollarSign, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppAuth } from '../hooks/useAppAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Skeleton shimmer card
function SkeletonCard() {
  return (
    <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 animate-pulse">
      <div className="w-16 h-16 rounded-xl bg-surfaceHover" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-surfaceHover rounded w-3/4" />
        <div className="h-6 bg-surfaceHover rounded w-1/2" />
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="glass-panel p-6 rounded-2xl animate-pulse">
      <div className="h-5 bg-surfaceHover rounded w-1/3 mb-6" />
      <div className="h-[300px] bg-surfaceHover rounded-xl" />
    </div>
  );
}

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [salesLoaded, setSalesLoaded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAppAuth();

  useEffect(() => {
    // Fetch products and sales independently so each renders as soon as it arrives
    axios.get(`${API_URL}/api/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.error('Products fetch error:', err))
      .finally(() => setProductsLoaded(true));

    axios.get(`${API_URL}/api/sales`)
      .then(res => setSales(res.data))
      .catch(err => console.error('Sales fetch error:', err))
      .finally(() => setSalesLoaded(true));
  }, []);

  const totalInventoryValue = products.reduce((acc, p) => acc + (p.quantity * p.costPricePKR), 0);
  const totalRevenue = sales.reduce((acc, s) => acc + (s.totalPKR || 0), 0);
  const totalProfit = sales.reduce((acc, s) => acc + (s.profitPKR || 0), 0);
  const lowStockCount = products.filter(p => p.quantity < 10).length;

  const revenueData = sales.slice(0, 7).map((s, i) => ({
    name: `Day ${i + 1}`,
    revenue: s.totalPKR || 0,
    profit: s.profitPKR || 0,
  })).reverse();

  const fallbackChartData = [
    { name: 'Mon', revenue: 4000, profit: 2400 },
    { name: 'Tue', revenue: 3000, profit: 1398 },
    { name: 'Wed', revenue: 5200, profit: 3100 },
    { name: 'Thu', revenue: 4800, profit: 2800 },
    { name: 'Fri', revenue: 6100, profit: 3900 },
  ];

  const stats = [
    { label: 'Total Inventory Value', value: productsLoaded ? `PKR ${totalInventoryValue.toLocaleString()}` : null, icon: Package, color: 'text-blue-500' },
    { label: 'Total Revenue', value: salesLoaded ? `PKR ${totalRevenue.toLocaleString()}` : null, icon: DollarSign, color: 'text-success' },
    { label: 'Total Profit', value: salesLoaded ? `PKR ${totalProfit.toLocaleString()}` : null, icon: TrendingUp, color: 'text-purple-500' },
    { label: 'Low Stock Items', value: productsLoaded ? lowStockCount : null, icon: AlertCircle, color: 'text-danger' },
  ];

  const firstName = user?.firstName || 'there';

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-gray-400 mt-1">Welcome back, <span className="text-primary font-semibold">{firstName}</span>. Here is your inventory summary.</p>
        </div>
        <button
          onClick={() => navigate('/inventory', { state: { openAddDrawer: true } })}
          className="btn-primary flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
        >
          <Package className="w-5 h-5" /> Register Product
        </button>
      </header>

      {/* Stats Grid — renders skeleton per card independently */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) =>
          stat.value === null ? (
            <SkeletonCard key={i} />
          ) : (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:border-primary/50 transition-colors"
            >
              <div className={`p-4 rounded-xl bg-surfaceHover ${stat.color}`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
            </motion.div>
          )
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        {!salesLoaded ? (
          <div className="lg:col-span-2"><SkeletonChart /></div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2 glass-panel p-6 rounded-2xl"
          >
            <h3 className="text-xl font-bold text-white mb-6">Revenue & Profit Overview</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData.length ? revenueData : fallbackChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* AI Insights panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 rounded-2xl flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6">
            <Bot className="text-primary w-6 h-6" />
            <h3 className="text-xl font-bold text-white">AI Insights</h3>
          </div>

          <div className="space-y-4 flex-1">
            {!productsLoaded ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-20 bg-surfaceHover rounded-xl" />
                <div className="h-20 bg-surfaceHover rounded-xl" />
              </div>
            ) : (
              <>
                {lowStockCount > 0 ? (
                  <div className="p-4 rounded-xl bg-danger/10 border border-danger/20">
                    <p className="text-sm text-danger font-semibold mb-1">⚠️ Low Stock Alert</p>
                    <p className="text-gray-300 text-sm">You have <strong>{lowStockCount}</strong> product{lowStockCount > 1 ? 's' : ''} running low. Consider reordering to prevent stockouts.</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                    <p className="text-sm text-success font-semibold mb-1">✅ Stock Levels Optimal</p>
                    <p className="text-gray-300 text-sm">All products are well stocked above the minimum threshold.</p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-primary font-semibold mb-1">💡 Profitability Tip</p>
                  <p className="text-gray-300 text-sm">Your most profitable items are driving 80% of revenue. Prioritize them in the next purchase order.</p>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => navigate('/ai-assistant')}
            className="btn-secondary mt-4 w-full justify-between group"
          >
            Ask AI Assistant
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </motion.div>
      </div>

      {/* Quick inventory table preview */}
      {productsLoaded && products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-panel p-6 rounded-2xl"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">Top Products Snapshot</h3>
            <button onClick={() => navigate('/inventory')} className="text-sm text-primary hover:underline">View All →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border text-gray-400 text-xs uppercase tracking-wider">
                  <th className="py-3 pr-6">Product</th>
                  <th className="py-3 pr-6">Category</th>
                  <th className="py-3 pr-6 text-right">Qty</th>
                  <th className="py-3 pr-6 text-right">Sell Price (PKR)</th>
                  <th className="py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {products.slice(0, 5).map((p) => (
                  <tr key={p._id} className="hover:bg-surfaceHover/40 transition-colors">
                    <td className="py-3 pr-6 font-semibold text-white">{p.name}</td>
                    <td className="py-3 pr-6 text-gray-400">{p.category || '—'}</td>
                    <td className="py-3 pr-6 text-right font-mono text-gray-300">{p.quantity}</td>
                    <td className="py-3 pr-6 text-right font-mono text-gray-300">{p.sellingPricePKR?.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      {p.quantity < 10
                        ? <span className="px-2 py-1 rounded-full bg-danger/10 text-danger text-xs font-semibold">Low Stock</span>
                        : <span className="px-2 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">In Stock</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
