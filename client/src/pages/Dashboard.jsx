import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Package, TrendingUp, AlertCircle, DollarSign, Bot } from 'lucide-react';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const [productsRes, salesRes] = await Promise.all([
          axios.get(`${API_URL}/api/products`),
          axios.get(`${API_URL}/api/sales`)
        ]);
        setProducts(productsRes.data);
        setSales(salesRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalInventoryValue = products.reduce((acc, p) => acc + (p.quantity * p.costPricePKR), 0);
  const totalRevenue = sales.reduce((acc, s) => acc + s.totalPKR, 0);
  const totalProfit = sales.reduce((acc, s) => acc + s.profitPKR, 0);
  const lowStockCount = products.filter(p => p.quantity < 10).length;

  // Mock chart data based on sales (in a real app, group by date)
  const revenueData = sales.slice(0, 7).map((s, i) => ({
    name: `Day ${i + 1}`,
    revenue: s.totalPKR,
    profit: s.profitPKR
  })).reverse();

  if (loading) return <div className="text-center mt-20"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>;

  const stats = [
    { label: 'Total Inventory Value', value: `PKR ${totalInventoryValue.toLocaleString()}`, icon: Package, color: 'text-blue-500' },
    { label: 'Total Revenue', value: `PKR ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-success' },
    { label: 'Total Profit', value: `PKR ${totalProfit.toLocaleString()}`, icon: TrendingUp, color: 'text-purple-500' },
    { label: 'Low Stock Items', value: lowStockCount, icon: AlertCircle, color: 'text-danger' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-gray-400 mt-1">Welcome back. Here is your inventory summary.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
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
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-panel p-6 rounded-2xl"
        >
          <h3 className="text-xl font-bold text-white mb-6">Revenue & Profit Overview</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData.length ? revenueData : [{name:'Mon', revenue:4000, profit:2400}, {name:'Tue', revenue:3000, profit:1398}]}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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

        {/* AI Recommendations */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-6 rounded-2xl flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6">
            <Bot className="text-primary w-6 h-6" />
            <h3 className="text-xl font-bold text-white">AI Insights</h3>
          </div>
          
          <div className="space-y-4 flex-1">
            {lowStockCount > 0 ? (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20">
                <p className="text-sm text-danger font-semibold mb-1">Low Stock Alert</p>
                <p className="text-gray-300 text-sm">You have {lowStockCount} products running low. Consider reordering soon to prevent stockouts.</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                <p className="text-sm text-success font-semibold mb-1">Stock Levels Optimal</p>
                <p className="text-gray-300 text-sm">All products are well stocked above the threshold.</p>
              </div>
            )}
            
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary font-semibold mb-1">Profitability Tip</p>
              <p className="text-gray-300 text-sm">Your most profitable items are driving 80% of revenue. Ensure they are prioritized in the next purchase order.</p>
            </div>
          </div>
          
          <button className="btn-secondary mt-4 w-full justify-between group">
            Ask AI Assistant
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
