import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import * as api from '../services/api';

const DEFAULT_ABOUT = `متجر ذُرى هو المتجر الالكتروني الاول في اليمن لبيع العطور الاصلية فقط باسعار اقل من الموقع الرسمي ويوفر خدمة التوصيل باقل من 24 ساعة ويوفر خدمة عينات العطور لتجربة عطرية مميزة لا شبيه لها ☺️✨

في عالم الكوبي - خليك مع ذُرى ✨`;

const AboutPage = () => {
  const [aboutText, setAboutText] = useState(DEFAULT_ABOUT);

  useEffect(() => {
    let mounted = true;
    api.getStoreInfo()
      .then((info) => {
        const t = String(info?.aboutUsText || '').trim();
        if (mounted && t) setAboutText(t);
      })
      .catch(() => { /* ignore */ });
    return () => { mounted = false; };
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          من نحن
        </h1>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 sm:p-8">
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line text-base sm:text-lg">
            {aboutText}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;

