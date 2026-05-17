import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Settings, Database, RefreshCw, AlertTriangle, FileText, Download } from 'lucide-react';

export default function SettingsPage() {
  const [dbUri, setDbUri] = useState('In-Memory Local Fallback');
  const [currency, setCurrency] = useState('PKR');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    axios.get(`${API_URL}/api/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleExportCSV = () => {
    if (products.length === 0) {
      alert("No data available to export.");
      return;
    }
    // Headers matching standard excel format
    const headers = ['Product Name', 'SKU', 'Category', 'Quantity', 'Cost Price (PKR)', 'Selling Price (PKR)', 'Stock Status'];
    const rows = products.map(p => [
      p.name,
      p.sku,
      p.category,
      p.quantity,
      p.costPricePKR,
      p.sellingPricePKR,
      p.quantity < 10 ? 'Low Stock' : 'In Stock'
    ]);
    
    // Add BOM character so Excel parses Pakistani Rupee symbols/UTF-8 correctly
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ainventory_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (products.length === 0) {
      alert("No data available to export.");
      return;
    }
    const printWindow = window.open('', '_blank');
    const totalValue = products.reduce((acc, p) => acc + (p.quantity * p.costPricePKR), 0);
    
    const html = `
      <html>
        <head>
          <title>AInventory System Report</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="p-8 font-sans bg-white text-gray-900">
          <div class="flex justify-between items-center border-b-2 border-indigo-600 pb-6 mb-8">
            <div>
              <h1 class="text-3xl font-extrabold text-indigo-900 tracking-tight">AInventory Analytics Report</h1>
              <p class="text-sm text-gray-500 mt-1">Generated: ${new Date().toLocaleDateString()} &bull; ${new Date().toLocaleTimeString()}</p>
            </div>
            <div class="text-right">
              <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-full">System Document</span>
            </div>
          </div>
          
          <!-- Summary Cards -->
          <div class="grid grid-cols-3 gap-6 mb-8">
            <div class="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <p class="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total Products</p>
              <p class="text-2xl font-bold text-indigo-900 mt-1">${products.length}</p>
            </div>
            <div class="p-4 bg-purple-50/50 rounded-xl border border-purple-100">
              <p class="text-xs font-semibold text-purple-600 uppercase tracking-wider">Total Value (Cost)</p>
              <p class="text-2xl font-bold text-purple-900 mt-1">${totalValue.toLocaleString()} PKR</p>
            </div>
            <div class="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
              <p class="text-xs font-semibold text-amber-600 uppercase tracking-wider">Low Stock items</p>
              <p class="text-2xl font-bold text-amber-900 mt-1">${products.filter(p => p.quantity < 10).length}</p>
            </div>
          </div>

          <h2 class="text-xl font-bold text-indigo-900 mb-4">Stock Ledger Catalog</h2>
          <table class="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr class="bg-indigo-600 text-white">
                <th class="p-3 font-semibold rounded-l-lg">Product Name</th>
                <th class="p-3 font-semibold">SKU</th>
                <th class="p-3 font-semibold">Category</th>
                <th class="p-3 font-semibold text-right">Quantity</th>
                <th class="p-3 font-semibold text-right">Cost (PKR)</th>
                <th class="p-3 font-semibold text-right rounded-r-lg">Sell Price (PKR)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${products.map(p => `
                <tr class="hover:bg-gray-50/80">
                  <td class="p-3 font-semibold text-gray-900">${p.name}</td>
                  <td class="p-3 text-gray-500 font-mono text-[11px]">${p.sku}</td>
                  <td class="p-3 text-gray-500">${p.category}</td>
                  <td class="p-3 text-right font-semibold ${p.quantity < 10 ? 'text-amber-600' : 'text-gray-700'}">${p.quantity}</td>
                  <td class="p-3 text-right text-gray-600">${p.costPricePKR.toLocaleString()}</td>
                  <td class="p-3 text-right text-gray-900 font-semibold">${p.sellingPricePKR.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="mt-16 text-center text-xs text-gray-400 border-t border-gray-100 pt-6">
            AInventory Management Portal &bull; Generated Securely &bull; Confidential Document
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Settings className="text-primary" /> Settings
        </h1>
        <p className="text-gray-400">Configure application preferences and export stock ledgers.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Config */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Document & Data Export Hub */}
          <div className="glass-panel p-6 rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-transparent">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" /> Document & Export Hub
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Generate perfectly structured analytical reports or spreadsheets of your entire database with one click.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={handleExportPDF}
                className="p-4 rounded-xl border border-border bg-surfaceHover hover:bg-primary/10 hover:border-primary/40 flex flex-col items-start gap-2 transition-all group"
              >
                <div className="p-2 rounded-lg bg-danger/10 text-danger group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Download PDF Ledger</h3>
                <p className="text-xs text-gray-400 text-left leading-relaxed">
                  Generates an official styled analytics catalog with total values and low stock highlights.
                </p>
              </button>

              <button 
                onClick={handleExportCSV}
                className="p-4 rounded-xl border border-border bg-surfaceHover hover:bg-success/10 hover:border-success/40 flex flex-col items-start gap-2 transition-all group"
              >
                <div className="p-2 rounded-lg bg-success/10 text-success group-hover:scale-110 transition-transform">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Export Excel Spreadsheet</h3>
                <p className="text-xs text-gray-400 text-left leading-relaxed">
                  Downloads an fully structured CSV spreadsheet optimized for instant Excel importing.
                </p>
              </button>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-border">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" /> Regional Preferences
            </h2>

            <div className="space-y-4">
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
