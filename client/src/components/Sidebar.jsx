import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Truck, Users, Settings, Sparkles, X, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppAuth } from '../hooks/useAppAuth';

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
  const { user, signOut, isSignedIn } = useAppAuth();

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
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.3)] overflow-hidden">
              <div className="absolute inset-[1px] bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <span className="text-sm font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-primary to-purple-400">
                  AI
                </span>
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 font-extrabold">AI</span>
              <span className="text-gray-200 font-medium">nventory</span>
            </span>
          </div>
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
      
      <div className="p-4 mt-auto space-y-4">
        {/* User profile card */}
        {isSignedIn && user && (
          <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <img 
                src={user.imageUrl} 
                alt={user.fullName || 'User'} 
                className="w-9 h-9 rounded-full border border-primary/30 object-cover shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Rashid Abid'}</p>
                <p className="text-xs text-gray-400 truncate">{user.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
            <button 
              onClick={() => signOut()}
              className="p-2 hover:bg-danger/10 text-gray-400 hover:text-danger rounded-lg transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

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
