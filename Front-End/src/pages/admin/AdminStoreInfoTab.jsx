import React from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Info,
  Phone,
  Mail,
  Link as LinkIcon,
  Loader2,
} from 'lucide-react';

const AdminStoreInfoTab = ({ storeInfo, setStoreInfo, handleUpdateStoreInfo, storeInfoSaving }) => {
  return (
    <div className="max-w-3xl">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">معلومات المتجر الأساسية</h2>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                رقم التواصل (للواتساب)
              </label>
              <input
                type="text"
                dir="ltr"
                value={storeInfo.contactPhone}
                onChange={(e) => setStoreInfo({ ...storeInfo, contactPhone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-gold-500/50 text-slate-900 dark:text-white"
                placeholder="مثال: +967770000000"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400" />
                رابط الواتساب المباشر
              </label>
              <input
                type="text"
                dir="ltr"
                value={storeInfo.whatsappUrl}
                onChange={(e) => setStoreInfo({ ...storeInfo, whatsappUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-gold-500/50 text-slate-900 dark:text-white"
                placeholder="https://wa.me/..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                dir="ltr"
                value={storeInfo.contactEmail}
                onChange={(e) => setStoreInfo({ ...storeInfo, contactEmail: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-gold-500/50 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400" />
                فيسبوك
              </label>
              <input
                type="text"
                dir="ltr"
                value={storeInfo.facebookUrl}
                onChange={(e) => setStoreInfo({ ...storeInfo, facebookUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-gold-500/50 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400" />
                تويتر
              </label>
              <input
                type="text"
                dir="ltr"
                value={storeInfo.twitterUrl}
                onChange={(e) => setStoreInfo({ ...storeInfo, twitterUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-gold-500/50 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400" />
                انستجرام
              </label>
              <input
                type="text"
                dir="ltr"
                value={storeInfo.instagramUrl}
                onChange={(e) => setStoreInfo({ ...storeInfo, instagramUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-gold-500/50 text-slate-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                نص عرض الشحن (يظهر أعلى الموقع)
              </label>
              <input
                type="text"
                value={storeInfo.shippingOfferText}
                onChange={(e) => setStoreInfo({ ...storeInfo, shippingOfferText: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-gold-500/50 text-slate-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                عنوان الموقع (SEO Title)
              </label>
              <input
                type="text"
                value={storeInfo.seoTitle}
                onChange={(e) => setStoreInfo({ ...storeInfo, seoTitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-gold-500/50 text-slate-900 dark:text-white"
                placeholder="مثال: قصة | Gisaah"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                وصف الموقع لمحركات البحث (SEO Description)
              </label>
              <textarea
                value={storeInfo.seoDescription}
                onChange={(e) => setStoreInfo({ ...storeInfo, seoDescription: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-gold-500/50 min-h-[80px] text-slate-900 dark:text-white"
                placeholder="وصف مختصر للمتجر يظهر في نتائج بحث جوجل..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" />
                عن المتجر
              </label>
              <textarea
                value={storeInfo.aboutUsText}
                onChange={(e) => setStoreInfo({ ...storeInfo, aboutUsText: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-gold-500/50 min-h-[120px] text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleUpdateStoreInfo}
            disabled={storeInfoSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gold-600 hover:bg-gold-500 text-white font-bold rounded-xl transition-all shadow-sm shadow-gold-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {storeInfoSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التغييرات
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStoreInfoTab;
