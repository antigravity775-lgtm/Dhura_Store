import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Truck, CreditCard, Banknote, Instagram } from 'lucide-react';

const Footer = ({ storeInfo }) => {
  const phone = (storeInfo?.contactPhone || '774405120').trim();
  const phoneDigits = phone.replace(/[^\d]/g, '');
  const phoneE164 = phoneDigits.startsWith('967') ? phoneDigits : `967${phoneDigits}`;
  const whatsappUrl = storeInfo?.whatsappUrl || `https://wa.me/${phoneE164}`;
  const instagramUrl = storeInfo?.instagramUrl || 'https://instagram.com/dhura';
  return (
    <footer className="bg-[#120F09] text-slate-400 py-8 border-t border-[#2A1F0A] mt-auto" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid: Mobile 2-col, Desktop 4-col */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
          
          {/* Brand & Short text */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/Logo_192.png" alt="شعار DHURA ذُرى" width="32" height="32" className="w-8 h-8 rounded-full bg-white object-cover object-center scale-[1.16] border-2 border-dhura-800" loading="lazy" />
              <span className="font-extrabold text-white text-lg tracking-tight font-display">DHURA <span className="text-dhura-400 text-base">ذُرى</span></span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 max-w-xs">
              متجر ذُرى هو المتجر الالكتروني الاول في اليمن لبيع العطور الاصلية فقط بأسعار أقل من الموقع الرسمي.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">الشركة</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2A1F0A] group-hover:bg-dhura-500 transition-colors"></span>
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2A1F0A] group-hover:bg-dhura-500 transition-colors"></span>
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">الدعم</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/contact" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-indigo-500 transition-colors"></span>
                  اتصل بنا
                </Link>
              </li>
              {storeInfo?.contactEmail && (
                <li>
                  <a href={`tel:${phoneDigits}`} className="hover:text-white transition-colors flex items-center gap-1.5 group">
                    <Mail className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
                    راسلنا للإستفسار
                  </a>
                </li>
              )}
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                  <Truck className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  تتبع الطلب
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">تواصل معنا</h4>
            <ul className="space-y-2 text-xs">
              {/* <li>
                <a href={storeInfo?.facebookUrl || '#'} target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                  <Facebook className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-500 transition-colors" />
                  صفحة فيسبوك
                </a>
              </li> */}
              <li>
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                  <MessageCircle className="w-3.5 h-3.5 text-slate-600 group-hover:text-green-500 transition-colors" />
                  واتساب
                </a>
              </li>
              <li>
                <a href={instagramUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                  <Instagram className="w-3.5 h-3.5 text-slate-600 group-hover:text-pink-500 transition-colors" />
                  انستغرام
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Socket */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-slate-600 font-medium flex flex-wrap items-center gap-x-2 gap-y-1 justify-center sm:justify-start text-center sm:text-right">
            <span>&copy; 2026 ذُرى. جميع الحقوق محفوظة.</span>
            <span className="text-slate-800/70 dark:text-slate-700/70 hidden sm:inline">|</span>
            <span className="text-slate-600/90">
              <Link
                to="/credits"
                className="text-slate-500 hover:text-white transition-colors underline underline-offset-4 decoration-slate-700 hover:decoration-white"
              >
                صفحة المطوّر
              </Link>
            </span>
          </div>
          
          <div className="flex items-center gap-3 opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all">
            <div className="flex items-center justify-center p-1.5 bg-slate-800 rounded-md border border-slate-700" title="الدفع عند الاستلام">
              <Banknote className="w-4 h-4 text-slate-300" />
            </div>
            <div className="flex items-center justify-center p-1.5 bg-slate-800 rounded-md border border-slate-700" title="البطاقة البنكية">
              <CreditCard className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
