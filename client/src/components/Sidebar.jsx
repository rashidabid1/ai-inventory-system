import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Truck, Users, Settings, Sparkles, X } from 'lucide-react';
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

export default function Sidebar({ isOpen, setIsOpen }) {
  return (
    <>
      {/* Backdrop overlay on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div 
        className={`fixed inset-y-0 left-0 w-64 glass-panel border-r border-y-0 border-l-0 border-border flex flex-col z-50 transition-transform duration-300 md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 flex items-center gap-2">
            <Sparkles className="text-primary" />
            AInventory
          </h1>
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 hover:bg-surfaceHover rounded-lg text-gray-400 hover:text-white md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
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
    </div>
  </>
  );
}
