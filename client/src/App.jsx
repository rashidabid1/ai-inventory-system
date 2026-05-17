import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import AiAssistant from './pages/AiAssistant';
import Directory from './pages/Directory';
import SettingsPage from './pages/Settings';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function AuthenticatedApp({ sidebarOpen, setSidebarOpen }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Mobile header bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0B0F19]/90 backdrop-blur-md border-b border-border fixed top-0 left-0 right-0 z-30 h-16">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-600 shadow-[0_0_10px_rgba(99,102,241,0.3)] overflow-hidden">
            <div className="absolute inset-[1px] bg-[#0B0F19] rounded-[7px] flex items-center justify-center">
              <span className="text-[10px] font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-primary to-purple-400">
                AI
              </span>
            </div>
          </div>
          <span className="text-lg font-bold tracking-tight text-white flex items-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 font-extrabold">AI</span>
            <span className="text-gray-200 font-medium">nventory</span>
          </span>
        </div>
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 hover:bg-surfaceHover rounded-xl text-gray-300 hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <main className="flex-1 overflow-y-auto p-6 md:p-8 pt-24 md:pt-8">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/ai-assistant" element={<AiAssistant />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If Clerk is enabled, enforce full login gateway
  if (publishableKey && publishableKey.trim() !== '') {
    return (
      <Router>
        <SignedIn>
          <AuthenticatedApp sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </SignedIn>
        <SignedOut>
          <div className="flex h-screen items-center justify-center bg-background relative overflow-hidden p-4">
            {/* Background blur elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[150px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[150px]"></div>
            
            <div className="glass-panel p-8 rounded-3xl z-10 max-w-md w-full border border-border flex flex-col items-center">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="text-primary w-8 h-8 animate-pulse" />
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                  AInventory
                </h1>
              </div>
              <p className="text-gray-400 text-center mb-8">
                Sign in with your Google or social account to access the AI Inventory dashboard.
              </p>
              
              <SignIn 
                routing="hash"
                appearance={{
                  variables: {
                    colorPrimary: '#6366f1',
                    colorBackground: '#0F172A',
                    colorText: '#ffffff',
                    colorTextSecondary: '#94a3b8',
                  },
                  elements: {
                    card: 'bg-transparent border-0 shadow-none',
                    headerTitle: 'hidden',
                    headerSubtitle: 'hidden',
                    footer: 'bg-transparent',
                  }
                }}
              />
            </div>
          </div>
        </SignedOut>
      </Router>
    );
  }

  // Fallback: Run app in developer/guest mode directly
  return (
    <Router>
      <AuthenticatedApp sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </Router>
  );
}

export default App;
