import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListOrdered, 
  Settings, 
  LogOut,
  Waves,
  Menu,
  X
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import GarmentPriceList from './components/GarmentPriceList';
import { laundryService } from './services/laundryService';
import { Order } from './types';
import { cn } from './lib/utils';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';

type View = 'dashboard' | 'orders' | 'new-order' | 'settings';

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoadingAuth(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    laundryService.seedGarmentTypes();
    const unsubscribe = laundryService.subscribeToOrders((newOrders) => {
      setOrders(newOrders);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSignOut = () => signOut(auth);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'All Orders', icon: ListOrdered },
    { id: 'new-order', label: 'Create Order', icon: PlusCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard orders={orders} />;
      case 'new-order': return <OrderForm onSuccess={() => setActiveView('orders')} />;
      case 'orders': return <OrderList orders={orders} />;
      case 'settings': return <GarmentPriceList />;
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center space-y-8"
        >
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 mx-auto">
            <Waves className="text-white w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Online Laundry</h1>
            <p className="text-slate-500 text-sm">Sign in to manage your laundry operations with AI precision.</p>
          </div>
          <button 
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 px-6 py-3 rounded-xl hover:bg-slate-50 transition-all font-semibold shadow-sm"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
            <span>Continue with Google</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-50 transition-all duration-300"
      >
        <div className="p-8 flex items-center space-x-3 h-16 border-b border-slate-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
            <Waves className="text-white w-5 h-5" />
          </div>
          {isSidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-sans font-bold text-xl tracking-tight text-slate-900"
            >
              Online Laundry
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative text-sm font-medium",
                activeView === item.id 
                  ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", activeView === item.id ? "text-indigo-600" : "group-hover:text-slate-600")} />
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {item.label}
                </motion.span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button 
            onClick={handleSignOut}
            className="flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors w-full text-sm font-medium"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span>System Exit</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className="flex-1 transition-all duration-300 min-h-screen"
        style={{ marginLeft: isSidebarOpen ? 280 : 80 }}
      >
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
           <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors text-slate-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-sm font-medium text-slate-500 uppercase tracking-widest">{activeView.replace('-', ' ')}</span>
           </div>
           <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Operator</span>
                 <span className="text-sm font-semibold text-slate-900">{user?.displayName || 'Guest User'}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 overflow-hidden">
                 {user?.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                    <span className="font-mono text-[10px] font-bold">{(user?.displayName || 'G').charAt(0).toUpperCase()}</span>
                 )}
              </div>
           </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
