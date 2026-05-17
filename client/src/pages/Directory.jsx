import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Truck, UserCheck, Plus, Search, Mail, Phone, MapPin } from 'lucide-react';

export default function Directory() {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [searchQuery, setSearchQuery] = useState('');

  const suppliers = [
    { name: 'Pak Computers Ltd', contact: 'Zubair Khan', email: 'zubair@pakcomp.pk', phone: '+92 300 1234567', address: 'Hafeez Center, Lahore' },
    { name: 'KHI Electronics', contact: 'M. Ali', email: 'ali@khielec.pk', phone: '+92 321 7654321', address: 'Saddar, Karachi' },
    { name: 'ISB Tech Distributors', contact: 'Ayesha Shah', email: 'ayesha@isbtech.pk', phone: '+92 333 9876543', address: 'Blue Area, Islamabad' }
  ];

  const customers = [
    { name: 'Rashid Abid', contact: 'Rashid Abid', email: 'rashid@example.com', phone: '+92 312 4567890', address: 'DHA Phase 6, Lahore' },
    { name: 'Kamran Malik', contact: 'Kamran Malik', email: 'kamran@example.com', phone: '+92 304 9998887', address: 'Clifton, Karachi' },
    { name: 'Sana Fatima', contact: 'Sana Fatima', email: 'sana@example.com', phone: '+92 345 1112223', address: 'G-11, Islamabad' }
  ];

  const currentList = activeTab === 'suppliers' ? suppliers : customers;
  const filteredList = currentList.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users className="text-primary" /> Directory
          </h1>
          <p className="text-gray-400">Manage your suppliers and customers database.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add {activeTab === 'suppliers' ? 'Supplier' : 'Customer'}
        </button>
      </header>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface/50 p-2 rounded-xl border border-border">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'suppliers' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" /> Suppliers
          </button>
          <button 
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'customers' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Customers
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`} 
            className="input-field pl-10 pr-4 py-2 rounded-lg text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((item, idx) => (
          <motion.div 
            key={idx} 
            whileHover={{ y: -4 }}
            className="glass-panel p-6 rounded-2xl border border-border relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
            <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
            <p className="text-sm text-primary mb-4 font-medium flex items-center gap-1">
              Contact: {item.contact}
            </p>

            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{item.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{item.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{item.address}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
