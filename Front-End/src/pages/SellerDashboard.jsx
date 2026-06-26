import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Package,
  BarChart3,
  LayoutDashboard,
  Home,
  User,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SellerProductsTab from './seller/SellerProductsTab';
import SellerSalesTab from './seller/SellerSalesTab';

const SellerDashboard = () => {
  const { user, isAuthenticated, isSeller } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (!isAuthenticated || !isSeller) {
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, isSeller, navigate]);

  const tabItems = [
    { id: 'products', label: 'المنتجات', icon: Package },
    { id: 'sales', label: 'المبيعات', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-bone dark:bg-slate-950 font-sans" dir="rtl">
      {/* Top Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-agate-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 dark:text-white text-lg leading-none">لوحة البائع</h1>
              <p className="text-xs text-slate-400 mt-0.5">مرحباً، {user?.fullName || 'بائع'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="text-sm text-slate-400 hover:text-agate-600 dark:hover:text-agate-400 font-medium transition-colors hidden sm:block"
            >
              <User className="w-4 h-4 inline ml-1" /> الملف الشخصي
            </Link>
            <Link
              to="/"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-agate-600 dark:hover:text-agate-400 font-medium transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" /> الرئيسية
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6 overflow-x-auto">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-agate-700 dark:text-agate-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'products' && <SellerProductsTab />}
        {activeTab === 'sales' && <SellerSalesTab />}
      </div>
    </div>
  );
};

export default SellerDashboard;
