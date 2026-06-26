import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Users,
  ShieldBan,
  ShieldCheck,
  Trash2,
  Download,
  Loader2,
} from 'lucide-react';
import * as XLSX from 'xlsx';

const AdminUsersTab = ({ users, usersLoading, handleBlockUser, handleChangeRole, handleDeleteUser }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    return users.filter(u => 
      !searchQuery.trim() || 
      u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.phoneNumber?.includes(searchQuery)
    );
  }, [users, searchQuery]);

  const handleExportExcel = () => {
    if (filteredUsers.length === 0) return;
    
    const exportData = filteredUsers.map(user => ({
      'المعرف': user.id,
      'الاسم': user.fullName,
      'رقم الهاتف': user.phoneNumber,
      'البريد الإلكتروني': user.email,
      'الدور': user.role,
      'تاريخ التسجيل': new Date(user.createdAt).toLocaleDateString("ar-EG"),
      'الحالة': user.isBlocked ? 'محظور' : 'نشط',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المستخدمين");
    XLSX.writeFile(wb, `users_export_${new Date().toLocaleDateString("en-US")}.xlsx`);
  };

  const getRoleBadge = (role) => {
    const styles = {
      Admin: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
      Seller: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
      Buyer: "bg-bone text-slate-600 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700",
    };
    const labels = { Admin: "مسؤول", Seller: "بائع", Buyer: "مشتري" };
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${styles[role] || styles.Buyer}`}>{labels[role] || role}</span>;
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">إدارة المستخدمين</h2>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors border border-emerald-200"
          >
            <Download className="w-4 h-4" />
            تصدير Excel
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-agate-500/50 transition-all dark:bg-slate-900 dark:border-slate-700"
          />
        </div>
      </div>

      {usersLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-agate-500 animate-spin" /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 dark:bg-slate-900 dark:border-slate-700">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">لا يوجد مستخدمين</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers
            .map((u, i) => (
              <motion.div key={u.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }} className="bg-white p-5 rounded-2xl border shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-agate-100 flex items-center justify-center text-agate-600 font-bold text-lg dark:bg-agate-900/30 dark:text-agate-400">
                    {u.fullName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate dark:text-white">{u.fullName}</h3>
                    <p className="text-xs text-slate-500 truncate" dir="ltr">{u.phoneNumber}</p>
                  </div>
                  {getRoleBadge(u.role)}
                </div>
                
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => handleBlockUser(u.id)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${u.isBlocked ? 'text-emerald-600 bg-emerald-50' : 'text-orange-600 bg-orange-50'}`}>
                    {u.isBlocked ? <><ShieldCheck className="w-3.5 h-3.5" /> فك الحظر</> : <><ShieldBan className="w-3.5 h-3.5" /> حظر</>}
                  </button>
                  
                  <select value={u.role} onChange={(e) => handleChangeRole(u.id, e.target.value)} className="px-2 py-1.5 bg-slate-50 border rounded-lg text-xs font-semibold dark:bg-slate-800">
                    <option value="Buyer">مشتري</option>
                    <option value="Seller">بائع</option>
                    <option value="Admin">مسؤول</option>
                  </select>

                  <div className="flex-1" />
                  <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsersTab;
