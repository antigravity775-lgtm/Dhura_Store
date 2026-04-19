import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import * as api from '../services/api';
import { Phone, MessageCircle, Instagram, Mail } from 'lucide-react';

const ContactPage = () => {
  const [storeInfo, setStoreInfo] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.getStoreInfo()
      .then((info) => { if (mounted) setStoreInfo(info); })
      .catch(() => { if (mounted) setStoreInfo(null); });
    return () => { mounted = false; };
  }, []);

  const phone = useMemo(() => (storeInfo?.contactPhone || '774405120').trim(), [storeInfo]);
  const phoneDigits = useMemo(() => phone.replace(/[^\d]/g, ''), [phone]);
  const phoneE164 = useMemo(() => (phoneDigits.startsWith('967') ? phoneDigits : `967${phoneDigits}`), [phoneDigits]);

  const whatsappUrl = storeInfo?.whatsappUrl || `https://wa.me/${phoneE164}`;
  const instagramUrl = storeInfo?.instagramUrl || 'https://instagram.com/dhura';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          اتصل بنا
        </h1>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 sm:p-8">
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            لأي استفسار أو مساعدة، تواصل معنا عبر الوسائل التالية:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`tel:${phoneDigits}`}
              className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500/60 hover:bg-amber-50/60 dark:hover:bg-amber-500/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <Phone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">اتصل بنا</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{phone}</div>
              </div>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500/60 hover:bg-emerald-50/60 dark:hover:bg-emerald-500/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">واتساب</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{phone}</div>
              </div>
            </a>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-500/60 hover:bg-pink-50/60 dark:hover:bg-pink-500/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                <Instagram className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">انستغرام</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">تابعنا على انستغرام</div>
              </div>
            </a>

            {storeInfo?.contactEmail && (
              <a
                href={`mailto:${storeInfo.contactEmail}`}
                className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">راسلنا</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{storeInfo.contactEmail}</div>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;

