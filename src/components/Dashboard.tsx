import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { cn } from '../lib/utils';

interface DashboardProps {
  orders: Order[];
}

export default function Dashboard({ orders }: DashboardProps) {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<OrderStatus, number>);

  const stats = [
    { label: 'Total Orders', value: totalOrders, change: '+12% from yesterday', color: 'text-slate-900', labelColor: 'text-slate-500', trend: 'text-emerald-600' },
    { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, change: 'Pending: ₹420.00', color: 'text-slate-900', labelColor: 'text-slate-500', trend: 'text-slate-400' },
    { label: 'Active Jobs', value: (statusCounts[OrderStatus.PROCESSING] || 0) + (statusCounts[OrderStatus.RECEIVED] || 0), change: `${statusCounts[OrderStatus.READY] || 0} Ready for pickup`, color: 'text-slate-900', labelColor: 'text-slate-500', trend: 'text-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
          >
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            <p className={cn("text-xs font-medium mt-1", stat.trend)}>{stat.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-900 uppercase tracking-tight text-sm">Status Distribution</h2>
          </div>
          <div className="p-8 space-y-6 flex-1 flex flex-col justify-center">
            {Object.values(OrderStatus).map((status) => {
              const count = statusCounts[status] || 0;
              const percentage = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
                    <span>{status}</span>
                    <span className="text-slate-900">{count} Orders</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-indigo-600 shadow-sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-xl shadow-indigo-100 flex-1 flex flex-col justify-center">
            <h4 className="text-xl font-bold mb-2">Smart Insights</h4>
            <p className="text-sm text-indigo-100 leading-relaxed mb-6">
              Your revenue is up by <span className="text-white font-bold">12%</span> this week. Most orders are currently in the <span className="italic">Processing</span> stage.
            </p>
            <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-white/20 self-start">
              Generate Detailed Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
