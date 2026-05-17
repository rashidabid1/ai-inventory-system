import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Key, Database, RefreshCw, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••••••••••');
  const [dbUri, setDbUri] = useState('In-Memory Local Fallback');
  const [currency, setCurrency] = useState('PKR');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Settings className="text-primary" /> Settings
        </h1>
        <p className="text-gray-400">Configure application preferences and system variables.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Config */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-border">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" /> AI & API Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Gemini Pro API Key</label>
                <input 
                  type="text" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  className="input-field py-3 pr-4 rounded-xl text-sm"
                  placeholder="Paste your Gemini API Key..."
                />
                <p className="text-xs text-gray-400 mt-2">Required for the AI Assistant context generation.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Primary Currency Symbol</label>
                <select 
                  value={currency} 
                  onChange={(e) => setCurrency(e.target.value)}
                  className="input-field py-3 pr-4 rounded-xl text-sm bg-gray-900"
                >
                  <option value="PKR">PKR (Pakistani Rupee)</option>
                  <option value="USD">USD (United States Dollar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-border">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" /> Database Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">MongoDB URI</label>
                <input 
                  type="text" 
                  value={dbUri} 
                  disabled
                  className="input-field py-3 pr-4 rounded-xl text-sm bg-gray-800/50 text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="flex gap-4">
                <button className="px-4 py-2 border border-border hover:bg-surfaceHover text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
                  <RefreshCw className="w-4 h-4" /> Reset Database
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-transparent">
            <h3 className="text-lg font-bold text-white mb-3">System Information</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex justify-between border-b border-border pb-2">
                <span>Frontend Server</span>
                <span className="text-success font-semibold">Running</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span>Backend Port</span>
                <span className="text-white">5000</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span>Node.js Version</span>
                <span className="text-white">v18.16.0</span>
              </div>
              <div className="flex justify-between">
                <span>AI Engine</span>
                <span className="text-primary font-semibold">Gemini 2.5 Flash</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-danger/10 border border-danger/20 text-danger-hover flex gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Production Notice</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Modifying variables directly might trigger service restarts. Ensure your cloud configurations are secure before moving to a hosted pipeline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
