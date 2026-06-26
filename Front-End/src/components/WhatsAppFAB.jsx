/**
 * WhatsAppFAB — زر واتساب العائم
 *
 * EN: Persistent floating WhatsApp contact button.
 *     Positioned bottom-left, above the mobile bottom nav.
 *     Fetches store WhatsApp URL from context/API dynamically.
 *
 * AR: زر واتساب عائم دائم لتسهيل التواصل المباشر.
 */

import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import * as api from '../services/api';

const WhatsAppFAB = () => {
  const [whatsappUrl, setWhatsappUrl] = useState('https://wa.me/967774405120');

  useEffect(() => {
    let mounted = true;
    api.getStoreInfo()
      .then((info) => {
        if (!mounted) return;
        const phone = (info?.contactPhone || '774405120').replace(/\D/g, '');
        const e164 = phone.startsWith('967') ? phone : `967${phone}`;
        const url = info?.whatsappUrl && !info.whatsappUrl.includes('chat.whatsapp.com')
          ? info.whatsappUrl
          : `https://wa.me/${e164}`;
        setWhatsappUrl(url);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-[88px] left-4 md:bottom-6 md:left-6 z-40 group"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping group-hover:animate-none" />
      <div className="relative w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-green-500/40 hover:shadow-green-500/60 hover:scale-110 transition-all duration-200">
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </div>
    </a>
  );
};

export default WhatsAppFAB;
