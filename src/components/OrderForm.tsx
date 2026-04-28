import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Sparkles, Loader2, Phone, User, ShoppingBag } from 'lucide-react';
import { laundryService } from '../services/laundryService';
import { parseLaundryOrder } from '../services/aiService';
import { OrderStatus, Garment, GarmentType } from '../types';
import { cn } from '../lib/utils';

export default function OrderForm({ onSuccess }: { onSuccess: () => void }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState<Garment[]>([{ type: '', quantity: 1, pricePerUnit: 0 }]);
  const [availableTypes, setAvailableTypes] = useState<GarmentType[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    laundryService.getGarmentTypes().then(types => {
      if (types) setAvailableTypes(types);
    });
  }, []);

  const handleAddItem = () => {
    setItems([...items, { type: '', quantity: 1, pricePerUnit: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof Garment, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === 'type') {
      const type = availableTypes.find(t => t.name === value);
      item.type = value as string;
      item.pricePerUnit = type?.basePrice || 0;
    } else {
      (item as any)[field] = value;
    }

    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || items.some(i => !i.type || i.quantity <=0)) {
      setError('Please fill all required fields correctly.');
      return;
    }

    try {
      await laundryService.createOrder({
        customerName,
        customerPhone,
        garments: items,
        totalAmount,
        status: OrderStatus.RECEIVED,
      });
      onSuccess();
    } catch (err) {
      setError('Failed to create order. Please try again.');
    }
  };

  const handleAiParse = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    setError('');
    
    const parsed = await parseLaundryOrder(aiInput);
    setIsAiLoading(false);

    if (parsed) {
      if (parsed.customerName) setCustomerName(parsed.customerName);
      if (parsed.customerPhone) setCustomerPhone(parsed.customerPhone);
      if (parsed.garments && Array.isArray(parsed.garments)) {
        const newItems = parsed.garments.map((g: any) => {
          const type = availableTypes.find(t => t.name.toLowerCase() === g.type.toLowerCase());
          return {
            type: type?.name || g.type,
            quantity: g.quantity || 1,
            pricePerUnit: type?.basePrice || 0
          };
        });
        setItems(newItems.length > 0 ? newItems : items);
      }
      setAiInput('');
    } else {
      setError('AI could not parse the order. Please enter manually.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* AI Assistant Section */}
      <section className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-600">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">AI Order Assistant</h3>
          </div>
          <span className="text-[10px] bg-white text-indigo-600 px-2 py-1 rounded font-bold uppercase tracking-wider border border-indigo-100">Smart Fetch</span>
        </div>
        <div className="relative">
          <textarea
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Describe the order: e.g., '3 shirts and 2 pants for Rahul, 9876543210'"
            className="w-full bg-white border border-slate-200 rounded-lg p-4 pr-32 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[80px]"
          />
          <button
            onClick={handleAiParse}
            disabled={isAiLoading || !aiInput.trim()}
            className="absolute bottom-3 right-3 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isAiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            <span>{isAiLoading ? 'Parsing...' : 'Analyze Order'}</span>
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-slate-900">New Order Entry</h2>
          <div className="flex space-x-2 text-[10px] font-bold text-slate-400">
            <span>#{Math.floor(Math.random() * 10000)}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase">Customer Information</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              placeholder="Full Name"
            />
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all mt-2"
              placeholder="Phone Number"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-slate-500 uppercase">Garment Selection</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded"
              >
                + ADD ITEM
              </button>
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 items-center"
                  >
                    <select
                      value={item.type}
                      onChange={(e) => handleItemChange(index, 'type', e.target.value)}
                      className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:border-indigo-500 outline-none"
                    >
                      <option value="">Select Item</option>
                      {availableTypes.map(t => <option key={t.id} value={t.name}>{t.name} (${t.basePrice})</option>)}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-16 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:border-indigo-500 outline-none text-center font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      disabled={items.length === 1}
                      className="p-1.5 text-slate-300 hover:text-red-500 disabled:opacity-0 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mt-4">
          <div className="flex justify-between text-sm mb-1 text-slate-500 font-medium">
            <span>Subtotal</span>
            <span>₹{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mb-3 text-slate-500 font-medium">
            <span>Est. Tax (5%)</span>
            <span>₹{(totalAmount * 0.05).toLocaleString()}</span>
          </div>
          <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
            <span className="font-bold text-slate-900 uppercase text-xs tracking-wider">Total Amount</span>
            <span className="text-2xl font-black text-indigo-600">₹{(totalAmount * 1.05).toLocaleString()}</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center space-x-2 active:scale-[0.98]"
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Generate Order Receipt</span>
        </button>
      </form>
    </div>
  );
}
