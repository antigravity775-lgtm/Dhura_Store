import React from 'react';
import Layout from '../components/Layout';
import { Code2, ExternalLink, Mail, Phone, Instagram } from 'lucide-react';

const CreditsPage = () => {
  const developer = {
    name: 'عبدالرحمن يوسف الجعدي',
    role: 'تصميم وتطوير المتجر الإلكتروني',
    website: 'https://api.whatsapp.com/send/?phone=967775181863&text&type=phone_number&app_absent=0&wame_ctl=1',
    instagram: 'https://www.instagram.com/m4man50?igsh=MW9zamphMnRkNGlncg==',
    email: null,
    phone: '967775181863',
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
            <Code2 className="w-5 h-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              صفحة المطوّر
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              شكر وتقدير لكل من ساهم في تطوير وتجهيز المتجر.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">المطوّر</div>
                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {developer.name}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {developer.role}
                </div>
              </div>

              {developer.website && (
                <a
                  href={developer.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors text-sm font-bold"
                >
                  تواصل واتساب
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {developer.instagram && (
                <a
                  href={developer.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-500/60 hover:bg-pink-50/60 dark:hover:bg-pink-500/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                    <Instagram className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">Instagram</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{developer.instagram}</div>
                  </div>
                </a>
              )}

              {developer.email && (
                <a
                  href={`mailto:${developer.email}`}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">Email</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{developer.email}</div>
                  </div>
                </a>
              )}

              {developer.phone && (
                <a
                  href={`tel:${developer.phone}`}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500/60 hover:bg-amber-50/60 dark:hover:bg-amber-500/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">Phone</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{developer.phone}</div>
                  </div>
                </a>
              )}
            </div>
          </div>

          <div className="px-6 sm:px-8 py-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              ملاحظة: هذه الصفحة مخصصة لعرض معلومات المطوّر بشكل محترم دون التأثير على تجربة التسوق أو تصميم المتجر.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreditsPage;

