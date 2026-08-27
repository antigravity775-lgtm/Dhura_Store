import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import * as api from '../services/api';
import { buildOrganizationSchema } from '../utils/structuredData';

const DEFAULT_ABOUT = `متجر قصة هو المتجر الالكتروني الاول في اليمن لبيع العطور الاصلية فقط باسعار اقل من الموقع الرسمي ويوفر خدمة التوصيل باقل من 24 ساعة ويوفر خدمة عينات العطور لتجربة عطرية مميزة لا شبيه لها ☺️✨

في عالم الكوبي - خليك مع قصة ✨`;

const AboutPage = () => {
  // null = still loading  |  string = data received (from DB or fallback)
  const [aboutText, setAboutText] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.getStoreInfo()
      .then((info) => {
        const t = String(info?.aboutUsText || '').trim();
        if (mounted) setAboutText(t || DEFAULT_ABOUT);
      })
      .catch(() => {
        if (mounted) setAboutText(DEFAULT_ABOUT);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <Layout>
      <SEO
        title="من نحن — قصة للعطور الأصلية"
        description="متجر قصة هو المتجر الإلكتروني الأول في اليمن لبيع العطور الأصلية بأسعار أقل من الموقع الرسمي مع توصيل سريع خلال ٢٤ ساعة."
        jsonLd={[buildOrganizationSchema()]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          من نحن
        </h1>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 sm:p-8 min-h-[120px]">
          {aboutText === null ? (
            /* Skeleton — prevents flash of wrong text */
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-5/6" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-4/5" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4" />
            </div>
          ) : (
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line text-base sm:text-lg">
              {aboutText}
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
