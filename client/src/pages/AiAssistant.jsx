import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Package, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppAuth } from '../hooks/useAppAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Greeting detection ───────────────────────────────────────────────────────
const GREETINGS = [
  /^\s*(hi|hello|hey|hiya|howdy|sup|yo)\b/i,
  /^\s*good\s*(morning|afternoon|evening|night)\b/i,
  /^\s*(as)?salaam(u\s*alaikum)?(\s+wa\s*rahmatullahi\s*wa\s*barakatuh)?\s*$/i,
  /^\s*salam\b/i,
  /^\s*assalam\b/i,
  /^\s*wa\s*alaikum/i,
  /^\s*aoa\s*$/i,
  /^\s*aoa\b/i,
];

const GREETING_RESPONSES = [
  "Hello! 👋 How can I assist you with your inventory today?",
  "Hey there! 😊 What would you like to know about your stock?",
  "Welcome back! 🚀 I'm ready to help. Ask me anything about your inventory.",
  "Hi! 👋 Need help finding products, checking stock levels, or analyzing your inventory?",
  "Hello! How can I help you manage your inventory today? 😊",
  "Hey! Great to see you. What inventory question can I answer for you?",
  "Salam! 👋 Kya main aapki inventory mein madad kar sakta hoon?",
];

function isGreeting(text) {
  return GREETINGS.some(r => r.test(text.trim()));
}

function randomGreeting() {
  return GREETING_RESPONSES[Math.floor(Math.random() * GREETING_RESPONSES.length)];
}

// ─── Local intent detection ───────────────────────────────────────────────────
function detectLocalIntent(text) {
  const q = text.toLowerCase().trim();

  if (/\b(show|list|view|display|all)\b.*\b(product|item|stock|inventory|catalogue)\b/i.test(q)
    || /\b(available\s*stock|what.*(in stock|available)|inventory)\b/i.test(q)) {
    return 'list_all';
  }

  if (/\b(low\s*stock|running\s*low|out\s*of\s*stock|reorder|critical\s*stock)\b/i.test(q)) {
    return 'low_stock';
  }

  const searchMatch = q.match(/(?:find|search|look\s*for|where\s*is|locate|do\s*you\s*have)\s+(.+)/i);
  if (searchMatch) return { intent: 'search', term: searchMatch[1].trim() };

  if (/\b(add|create|new|register)\b.*\b(product|item|stock)\b/i.test(q)) {
    return 'add_product';
  }

  if (/\b(delete|remove|drop)\b.*\b(product|item)\b/i.test(q)) {
    return 'delete_product';
  }

  if (/\b(update|edit|change|modify)\b.*\b(stock|quantity|product)\b/i.test(q)) {
    return 'update_stock';
  }

  if (/\b(summary|overview|metrics|value|profit|revenue|total)\b/i.test(q)) {
    return 'summary';
  }

  return null;
}

// ─── Format helpers ───────────────────────────────────────────────────────────
function formatProductTable(products, title = '📦 Inventory Products') {
  if (products.length === 0) return `**${title}**\n\nNo products found matching your query.`;

  const header = `### ${title}\n\n| # | Product Name | Category | Qty | Price (PKR) | Status |\n|:--|:-------------|:---------|:---:|:------------|:------|\n`;
  const rows = products.map((p, i) => {
    const status = p.quantity < 10 ? '🔴 Low Stock' : '🟢 In Stock';
    return `| ${i + 1} | **${p.name}** | ${p.category || '—'} | ${p.quantity} | PKR ${(p.sellingPricePKR || 0).toLocaleString()} | ${status} |`;
  }).join('\n');

  return header + rows + `\n\n**Total:** ${products.length} product${products.length !== 1 ? 's' : ''}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AiAssistant() {
  const { user } = useAppAuth();
  const firstName = user?.firstName || 'there';

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${firstName}! 👋 I'm your **AI Inventory Assistant**, powered by Google Gemini.\n\nHere's what I can do:\n- 📦 **Show all products** or search for specific items\n- 📉 **List low-stock items** that need reordering\n- 💰 **Analyze financial metrics** — revenue, profit, inventory value\n- 🔍 **Find any product** by name (e.g., *"Find Pepsi"* or *"Search milk"*)\n- ➕ Guide you on **adding, updating, or deleting** products\n\nWhat would you like to know?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState(null); // cache products locally for fast local intents
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Pre-fetch products once so local intent resolution is instant
  useEffect(() => {
    axios.get(`${API_URL}/api/products`)
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  const addMessage = useCallback((role, content) => {
    setMessages(prev => [...prev, { role, content }]);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query) return;

    addMessage('user', query);
    setInput('');
    setLoading(true);

    // ── 1. Local greeting handling (instant, no API call) ─────────────────────
    if (isGreeting(query)) {
      setTimeout(() => {
        addMessage('assistant', randomGreeting());
        setLoading(false);
      }, 400);
      return;
    }

    // ── 2. Local intent resolution (instant, uses cached products) ────────────
    const intent = detectLocalIntent(query);

    if (intent && products !== null) {
      let localResponse = null;

      if (intent === 'list_all') {
        localResponse = formatProductTable(products, '📦 Full Inventory Catalogue');
      } else if (intent === 'low_stock') {
        const lowItems = products.filter(p => p.quantity < 10);
        localResponse = formatProductTable(lowItems, '🔴 Low Stock Items (Quantity < 10)');
        if (lowItems.length === 0) {
          localResponse += '\n\n✅ Great news — all your products are well-stocked!';
        }
      } else if (intent?.intent === 'search') {
        const term = intent.term.toLowerCase();
        const found = products.filter(p =>
          p.name.toLowerCase().includes(term) ||
          (p.category || '').toLowerCase().includes(term) ||
          (p.sku || '').toLowerCase().includes(term)
        );
        localResponse = formatProductTable(found, `🔍 Search Results for "${intent.term}"`);
      } else if (intent === 'add_product') {
        localResponse = `### ➕ Adding a Product\n\nTo add a new product to your inventory:\n\n1. Navigate to the **Inventory** page from the sidebar\n2. Click the **"Register Product"** button (top-right)\n3. Fill in the product name, SKU, quantity, price, and category\n4. Click **Save**\n\nThe product will be instantly saved to your cloud database! ☁️`;
      } else if (intent === 'delete_product') {
        localResponse = `### 🗑️ Deleting a Product\n\nTo remove a product from your inventory:\n\n1. Go to the **Inventory** page\n2. Find the product in the list\n3. Click the **delete icon** (🗑️) on the right side of the row\n4. Confirm the deletion\n\n⚠️ **Note:** This action is permanent and cannot be undone.`;
      } else if (intent === 'update_stock') {
        localResponse = `### ✏️ Updating Stock\n\nTo update a product's quantity or details:\n\n1. Go to the **Inventory** page\n2. Find the product and click the **edit icon** (✏️)\n3. Update the quantity, price, or any other fields\n4. Click **Save**\n\nAlternatively, recording a **Sale** automatically reduces stock quantity.`;
      } else if (intent === 'summary') {
        // Let backend handle this for accurate financial data — fall through to API
        localResponse = null;
      }

      if (localResponse) {
        setTimeout(() => {
          addMessage('assistant', localResponse);
          setLoading(false);
        }, 300);
        return;
      }
    }

    // ── 3. Full Gemini AI backend call ─────────────────────────────────────────
    try {
      const res = await axios.post(`${API_URL}/api/ai/query`, { query });
      addMessage('assistant', res.data.response);
    } catch (error) {
      console.error(error);
      let errorMsg = '❌ Sorry, I encountered an error communicating with the backend server.';
      if (import.meta.env.VITE_API_URL) {
        errorMsg += `\n\n⚠️ **Cloud Notice:** Ensure your Render backend at \`${import.meta.env.VITE_API_URL}\` is awake and running. It may take 1–2 minutes to wake up after inactivity.`;
      } else {
        errorMsg += '\n\n⚠️ **Local Notice:** Ensure your Express backend is running on `http://localhost:5000`.';
      }
      addMessage('assistant', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Quick-action chip buttons
  const quickActions = [
    { label: '📦 Show all products', query: 'Show all products' },
    { label: '🔴 Low stock items', query: 'Show low stock items' },
    { label: '💰 Financial summary', query: 'Give me a full financial summary' },
    { label: '📈 Best sellers', query: 'Which products have the highest profit margin?' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[calc(100vh-80px)]">
      <header className="mb-4 flex items-center gap-3">
        <div className="p-3 bg-primary/20 rounded-xl">
          <Bot className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">AI Data Assistant</h1>
          <p className="text-gray-400 text-sm">Powered by Google Gemini · Ask anything about your inventory</p>
        </div>
      </header>

      {/* Quick action chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => {
              setInput(action.query);
              setTimeout(() => {
                document.getElementById('ai-send-btn')?.click();
              }, 50);
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-full bg-surface border border-border text-xs text-gray-300 hover:bg-primary/10 hover:border-primary/40 hover:text-white transition-all disabled:opacity-50"
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden relative">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-primary to-purple-600'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-4 h-4 text-white" />
                    : <Bot className="w-4 h-4 text-white" />
                  }
                </div>

                <div className={`max-w-[85%] md:max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/10'
                    : 'bg-surfaceHover border border-border text-gray-200 rounded-tl-none shadow-md shadow-black/20'
                }`}>
                  {msg.role === 'user' ? (
                    <span>{msg.content}</span>
                  ) : (
                    <ReactMarkdown
                      components={{
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-3 rounded-xl border border-border bg-background/50 shadow-inner">
                            <table className="w-full text-left border-collapse text-xs min-w-[500px]" {...props} />
                          </div>
                        ),
                        thead: ({ node, ...props }) => <thead className="bg-primary/10 border-b border-border text-white" {...props} />,
                        tbody: ({ node, ...props }) => <tbody className="divide-y divide-border/30" {...props} />,
                        th: ({ node, ...props }) => <th className="p-3 font-semibold text-primary text-xs" {...props} />,
                        td: ({ node, ...props }) => <td className="p-3 text-gray-300 text-xs" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-base font-bold text-white mt-3 mb-2" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                        li: ({ node, ...props }) => <li className="ml-4 mb-1 list-disc text-gray-300" {...props} />,
                        code: ({ node, inline, ...props }) => inline
                          ? <code className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono" {...props} />
                          : <code className="block p-3 bg-background rounded-lg text-xs font-mono text-gray-300 my-2 overflow-x-auto" {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-surfaceHover border border-border p-4 rounded-2xl rounded-tl-none">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  <span className="ml-2 text-xs text-gray-500">Thinking…</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-background/50 backdrop-blur-md">
          <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex gap-2 items-center">
            <input
              type="text"
              id="ai-chat-input"
              placeholder='Try "Show all products", "Find RTX GPU", or "Hello" 👋'
              className="input-field flex-1 bg-gray-900/80 pr-4 py-3.5 rounded-xl text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
            <button
              id="ai-send-btn"
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 bg-primary hover:bg-primaryHover text-white rounded-xl transition-colors disabled:opacity-50 shrink-0 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-center text-xs text-gray-600 mt-2">AI responses are generated based on your live cloud database.</p>
        </div>
      </div>
    </motion.div>
  );
}
