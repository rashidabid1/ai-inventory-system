import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Truck, Users, Settings, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: ShoppingCart, label: 'Sales', path: '/sales' },
  { icon: Truck, label: 'Purchases', path: '/purchases' },
  { icon: Sparkles, label: 'AI Assistant', path: '/ai-assistant' },
  { icon: Users, label: 'Directory', path: '/directory' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 glass-panel border-r border-y-0 border-l-0 border-border flex flex-col z-10"
    >
      <div className="p-6 mb-4">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 flex items-center gap-2">
          <Sparkles className="text-primary" />
          AInventory
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                  : 'text-gray-400 hover:bg-surfaceHover hover:text-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 mt-auto">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20 backdrop-blur-md">
          <p className="text-xs text-gray-300 font-medium mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            <span className="text-sm font-semibold text-white">All Systems Operational</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
