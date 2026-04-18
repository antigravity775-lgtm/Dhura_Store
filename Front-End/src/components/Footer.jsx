import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, MessageCircle, Mail, MapPin, Truck, ShieldAlert, CreditCard, Banknote } from 'lucide-react';

const Footer = ({ storeInfo }) => {
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
              متجر العطور والمنتجات الفاخرة. نختار لك أرقى العطور وأجود المنتجات بعناية فائقة.
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
                  <a href={`mailto:${storeInfo.contactEmail}`} className="hover:text-white transition-colors flex items-center gap-1.5 group">
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
              <li>
                <a href={storeInfo?.facebookUrl || '#'} target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                  <Facebook className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-500 transition-colors" />
                  صفحة فيسبوك
                </a>
              </li>
              <li>
                <a href={storeInfo?.whatsappUrl || '#'} target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5 group">
                  <MessageCircle className="w-3.5 h-3.5 text-slate-600 group-hover:text-green-500 transition-colors" />
                  واتساب
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Socket */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-slate-600 font-medium">
            &copy; 2026 DHURA ذُرى. جميع الحقوق محفوظة.
            <span className="mx-1.5">|</span>
            <span>تم التطوير بواسطة عبدالرحمن يوسف الجعدي</span>
            <span className="mx-1.5">|</span>
            <a
  href="https://wa.me/967775181863?text=Hello%2C%20I%20would%20like%20to%20get%20in%20touch%20with%20you"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Contact me on WhatsApp"
  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-all duration-200 shadow-md hover:shadow-lg"
>
  💬 Contact me on WhatsApp
</a>
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
