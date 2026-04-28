import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, MoreHorizontal, CheckCircle, Clock, Package, Truck, User, Phone, Calendar } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { laundryService } from '../services/laundryService';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface OrderListProps {
  orders: Order[];
}

export default function OrderList({ orders }: OrderListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.RECEIVED:
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200">RECEIVED</span>;
      case OrderStatus.PROCESSING:
        return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200">PROCESSING</span>;
      case OrderStatus.READY:
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">READY</span>;
      case OrderStatus.DELIVERED:
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold border border-slate-200">DELIVERED</span>;
    }
  };

  const handleStatusUpdate = (orderId: string, currentStatus: OrderStatus) => {
    const statuses = Object.values(OrderStatus);
    const currentIndex = statuses.indexOf(currentStatus);
    if (currentIndex < statuses.length - 1) {
      const nextStatus = statuses[currentIndex + 1];
      laundryService.updateOrderStatus(orderId, nextStatus);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 gap-4">
        <h2 className="font-bold text-slate-900 uppercase tracking-tight text-sm">Recent Orders</h2>
        <div className="flex space-x-2">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
             <input 
               type="text" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Search orders..." 
               className="text-xs border border-slate-200 rounded-md pl-9 pr-3 py-1.5 w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
             />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white font-medium text-slate-600"
          >
            <option value="ALL">All Status</option>
            {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="text-[10px] font-bold text-slate-500 bg-slate-50/80 sticky top-0 uppercase border-b border-slate-100 tracking-wider">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Items</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-400">#ORD-{order.id?.slice(-4).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{order.customerName}</div>
                    <div className="text-[10px] font-bold text-slate-400 flex items-center space-x-1">
                       <Phone className="w-2.5 h-2.5" />
                       <span>{order.customerPhone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                    {order.garments.map((g, i) => `${g.quantity}x ${g.type}`).join(', ')}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">₹{order.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleStatusUpdate(order.id!, order.status)}
                      disabled={order.status === OrderStatus.DELIVERED}
                      className="text-indigo-600 hover:text-indigo-800 font-bold text-xs disabled:opacity-0 transition-all uppercase tracking-wider"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                  No orders found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
