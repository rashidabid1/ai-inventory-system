import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import AiAssistant from './pages/AiAssistant';
import Directory from './pages/Directory';
import SettingsPage from './pages/Settings';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-background relative">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        {/* Mobile header bar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-surface/80 backdrop-blur-md border-b border-border fixed top-0 left-0 right-0 z-30 h-16">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
            AInventory
          </h1>
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
    </Router>
  );
}

export default App;
