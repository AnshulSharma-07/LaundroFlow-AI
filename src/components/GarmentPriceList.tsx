import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Save, Tag } from 'lucide-react';
import { laundryService } from '../services/laundryService';
import { GarmentType } from '../types';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function GarmentPriceList() {
  const [types, setTypes] = useState<GarmentType[]>([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return onSnapshot(collection(db, 'garmentTypes'), (snapshot) => {
      setTypes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GarmentType[]);
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || newPrice <= 0) return;
    setIsLoading(true);
    await addDoc(collection(db, 'garmentTypes'), { name: newName, basePrice: newPrice });
    setNewName('');
    setNewPrice(0);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'garmentTypes', id));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Price Configuration</h2>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase tracking-wider border border-slate-200">System Admin</span>
        </div>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-slate-50/50 p-4 rounded-lg border border-slate-100">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Garment</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-3 focus:border-indigo-500 outline-none text-xs font-medium"
              placeholder="e.g., Blazer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base (₹)</label>
            <input
              type="number"
              value={newPrice || ''}
              onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
              className="w-full bg-white border border-slate-200 rounded-md py-1.5 px-3 focus:border-indigo-500 outline-none text-xs font-bold"
              placeholder="0"
            />
          </div>
          <button
            disabled={isLoading || !newName || newPrice <= 0}
            className="bg-slate-900 text-white py-2 px-4 rounded-md text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        </form>

        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Active Rate Card</h4>
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
            {types.map((type) => (
              <motion.div
                key={type.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-3.5 bg-white group hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-indigo-50 rounded border border-indigo-100">
                    <Tag className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span className="font-bold text-slate-900 text-sm">{type.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-slate-900 font-bold text-sm">₹{type.basePrice.toLocaleString()}</span>
                  <button
                    onClick={() => handleDelete(type.id!)}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
