import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Info,
  Phone,
  Mail,
  Link as LinkIcon,
  Loader2,
  Database,
  Download,
  Upload,
  AlertTriangle,
  X,
  CheckCircle
} from 'lucide-react';
import { downloadDatabaseBackup, restoreDatabaseBackup } from '../../services/api';

const AdminStoreInfoTab = ({ storeInfo, setStoreInfo, handleUpdateStoreInfo, storeInfoSaving }) => {
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
  const [backupError, setBackupError] = useState('');

  // Restore State
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState('');
  const [restoreSuccess, setRestoreSuccess] = useState('');
  const [restoreConfirmationText, setRestoreConfirmationText] = useState('');
  const [restoreFile, setRestoreFile] = useState(null);

  const handleBackup = async () => {
    setIsDownloadingBackup(true);
    setBackupError('');
    try {
      const blob = await downloadDatabaseBackup();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `teeb_backup_${new Date().toISOString().split('T')[0]}.json.gz`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setShowBackupModal(false);
    } catch (err) {
      setBackupError(err.message || 'فشل تحميل النسخة الاحتياطية');
    } finally {
      setIsDownloadingBackup(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setRestoreFile(file);
    setShowRestoreModal(true);
    setRestoreConfirmationText('');
    setRestoreError('');
    setRestoreSuccess('');
    e.target.value = null; // reset input
  };

  const handleRestore = async () => {
    if (restoreConfirmationText !== 'RESTORE DATABASE') return;
    if (!restoreFile) return;

    setIsRestoring(true);
    setRestoreError('');
    setRestoreSuccess('');

    try {
      const res = await restoreDatabaseBackup(restoreFile);
      setRestoreSuccess(res.message || 'تم استعادة قاعدة البيانات بنجاح');
      setTimeout(() => {
        window.location.reload(); // Reload to fetch fresh data
      }, 2000);
    } catch (err) {
      setRestoreError(err.message || 'حدث خطأ أثناء الاستعادة');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
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
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-agate-500/50 text-slate-900 dark:text-white"
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
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-agate-500/50 text-slate-900 dark:text-white"
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
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-agate-500/50 text-slate-900 dark:text-white"
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
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-agate-500/50 text-slate-900 dark:text-white"
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
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-agate-500/50 text-slate-900 dark:text-white"
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
                value={storeInfo.instagramUrl || ''}
                onChange={(e) => setStoreInfo({ ...storeInfo, instagramUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-agate-500/50 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400" />
                تيك توك
              </label>
              <input
                type="text"
                dir="ltr"
                value={storeInfo.tiktokUrl || ''}
                onChange={(e) => setStoreInfo({ ...storeInfo, tiktokUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-agate-500/50 text-slate-900 dark:text-white"
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
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-agate-500/50 text-slate-900 dark:text-white"
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
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-agate-500/50 text-slate-900 dark:text-white"
                placeholder="مثال: طيب | Teeb"
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
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-agate-500/50 min-h-[80px] text-slate-900 dark:text-white"
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
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-agate-500/50 min-h-[120px] text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleUpdateStoreInfo}
            disabled={storeInfoSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-agate-600 hover:bg-agate-500 text-white font-bold rounded-xl transition-all shadow-sm shadow-agate-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {storeInfoSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التغييرات
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mt-10 mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">النسخ الاحتياطي لقاعدة البيانات</h2>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">تحميل نسخة احتياطية محلية</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">تصدير جميع البيانات الحساسة (المستخدمين، المنتجات، الطلبات) بتنسيق مشفر ومضغوط (.json.gz).</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowBackupModal(true)}
              className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              تنزيل 
            </button>
            <div className="relative w-full sm:w-auto">
              <input 
                type="file" 
                accept=".json.gz,.gz" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                title="استعادة نسخة احتياطية"
              />
              <button
                type="button"
                className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all shadow-sm border border-red-200 dark:border-red-800/30"
              >
                <Upload className="w-4 h-4" />
                استعادة 
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showBackupModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => !isDownloadingBackup && setShowBackupModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="bg-red-50 dark:bg-red-900/20 p-6 flex flex-col items-center text-center border-b border-red-100 dark:border-red-900/30">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">تأكيد التنزيل</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  سيتم تحميل نسخة احتياطية كاملة لجميع بيانات المتجر. هذه العملية تسجل في السجلات الأمنية لضمان الخصوصية.<br/><br/>
                  هل أنت متأكد من رغبتك في تحميل النسخة الاحتياطية؟
                </p>
                {backupError && (
                  <div className="mt-4 text-sm text-red-600 bg-red-100 px-3 py-2 rounded-lg w-full">
                    {backupError}
                  </div>
                )}
              </div>
              <div className="p-6 flex gap-3">
                <button 
                  onClick={handleBackup} 
                  disabled={isDownloadingBackup}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isDownloadingBackup ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  تأكيد التحميل
                </button>
                <button 
                  onClick={() => setShowBackupModal(false)}
                  disabled={isDownloadingBackup}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restore Confirmation Modal */}
      <AnimatePresence>
        {showRestoreModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => !isRestoring && setShowRestoreModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-red-200 dark:border-red-900">
              <div className="bg-red-50 dark:bg-red-900/20 p-6 flex flex-col items-center text-center border-b border-red-100 dark:border-red-900/30">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">تحذير: مسح واستعادة البيانات</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  سيتم مسح <strong>جميع البيانات الحالية</strong> واستبدالها ببيانات الملف المرفوع: 
                  <br/><span className="font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded text-red-600 dark:text-red-400 mt-2 inline-block border border-red-100 dark:border-red-900/50">{restoreFile?.name}</span>
                </p>
                <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-xs p-3 rounded-lg text-right w-full">
                  <ul className="list-disc list-inside space-y-1">
                    <li>يتم عمل نسخة احتياطية تلقائية قبل البدء.</li>
                    <li>تتم الاستعادة داخل معاملة واحدة (إما أن تنجح بالكامل أو تتراجع بالكامل).</li>
                    <li>سيتم الحفاظ على سجلات النشاطات الأمنية.</li>
                  </ul>
                </div>
              </div>
              <div className="p-6">
                {!restoreSuccess ? (
                  <>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      لتأكيد الاستعادة، يرجى كتابة <span className="text-red-600 dark:text-red-400 font-mono select-all">RESTORE DATABASE</span> أدناه:
                    </label>
                    <input
                      type="text"
                      value={restoreConfirmationText}
                      onChange={(e) => setRestoreConfirmationText(e.target.value)}
                      placeholder="RESTORE DATABASE"
                      dir="ltr"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500/50 text-slate-900 dark:text-white text-center font-mono font-bold uppercase mb-4"
                      disabled={isRestoring}
                    />

                    {restoreError && (
                      <div className="mb-4 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800">
                        {restoreError}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button 
                        onClick={handleRestore} 
                        disabled={isRestoring || restoreConfirmationText !== 'RESTORE DATABASE'}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isRestoring ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> جاري الاستعادة...</>
                        ) : (
                          <><Upload className="w-5 h-5" /> تأكيد الاستعادة المخاطرة</>
                        )}
                      </button>
                      <button 
                        onClick={() => setShowRestoreModal(false)}
                        disabled={isRestoring}
                        className="py-3 px-6 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{restoreSuccess}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">سيتم إعادة تحميل الصفحة لتطبيق التغييرات...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminStoreInfoTab;
