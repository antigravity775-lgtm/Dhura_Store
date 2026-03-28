/**
 * ThemeContext — سياق إدارة الوضع الداكن
 * 
 * EN: Global theme management with localStorage persistence and OS preference detection.
 *     
 *     Architecture:
 *     - Provides `theme` ('light' | 'dark') and `toggleTheme()` to all components
 *     - On mount, reads from localStorage first; falls back to OS preference
 *     - On toggle, saves to localStorage AND updates <html> class immediately
 *     - Listens for OS preference changes (e.g., user changes OS from light→dark)
 *       but only applies them if no manual preference is stored
 * 
 * AR: إدارة عامة للثيم مع حفظ في localStorage وكشف تفضيلات نظام التشغيل.
 *     
 *     الهيكل:
 *     - يوفر `theme` ('light' | 'dark') و `toggleTheme()` لكل المكونات
 *     - عند التحميل، يقرأ من localStorage أولاً؛ يرجع لتفضيل نظام التشغيل
 *     - عند التبديل، يحفظ في localStorage ويحدث كلاس <html> فوراً
 *     - يستمع لتغييرات تفضيل نظام التشغيل (مثلاً المستخدم يغير من فاتح→داكن)
 *       لكن يطبقها فقط إذا لم يكن هناك تفضيل يدوي محفوظ
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(undefined);

/**
 * EN: Reads the initial theme synchronously to prevent flicker.
 *     This mirrors the logic in the <head> anti-flicker script.
 * AR: يقرأ الثيم الأولي بشكل متزامن لمنع الوميض.
 *     هذا يعكس المنطق في سكريبت مضاد الوميض في <head>.
 */
function getInitialTheme() {
  // EN: Priority 1 — Check explicit user preference in localStorage
  // AR: الأولوية 1 — تحقق من التفضيل الصريح للمستخدم في localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }

    // EN: Priority 2 — Fall back to OS system preference
    // AR: الأولوية 2 — ارجع لتفضيل نظام التشغيل
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }

  // EN: Priority 3 — Default to light
  // AR: الأولوية 3 — الافتراضي فاتح
  return 'light';
}

/**
 * EN: Applies the theme class to <html> element.
 *     Tailwind's dark mode relies on the 'dark' class being present on <html>.
 * AR: يطبق كلاس الثيم على عنصر <html>.
 *     الوضع الداكن في Tailwind يعتمد على وجود كلاس 'dark' على <html>.
 */
function applyThemeToDOM(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  // EN: Apply theme to DOM whenever it changes
  // AR: طبق الثيم على DOM كلما تغير
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // EN: Listen for OS preference changes (e.g., user toggles OS dark mode)
  //     Only applies if no manual preference is stored in localStorage.
  // AR: استمع لتغييرات تفضيل نظام التشغيل (مثلاً المستخدم يبدل الوضع الداكن في النظام)
  //     يُطبَّق فقط إذا لم يكن هناك تفضيل يدوي محفوظ في localStorage.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      // EN: Only follow OS preference if user hasn't set manual preference
      // AR: اتبع تفضيل النظام فقط إذا لم يحدد المستخدم تفضيلاً يدوياً
      const stored = localStorage.getItem('theme');
      if (!stored) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  /**
   * toggleTheme — تبديل الثيم
   * 
   * EN: Toggles between light and dark mode.
   *     Saves the choice to localStorage so it persists across sessions.
   *     This is a MANUAL preference — it overrides OS settings from now on.
   * 
   * AR: يبدل بين الوضع الفاتح والداكن.
   *     يحفظ الاختيار في localStorage ليبقى عبر الجلسات.
   *     هذا تفضيل يدوي — يتجاوز إعدادات نظام التشغيل من الآن.
   */
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      // EN: Save to localStorage — this becomes the user's explicit preference
      // AR: حفظ في localStorage — هذا يصبح التفضيل الصريح للمستخدم
      localStorage.setItem('theme', next);
      return next;
    });
  }, []);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme — خطاف الثيم
 * 
 * EN: Custom hook to access theme state and toggle function.
 *     Returns: { theme: 'light'|'dark', isDark: boolean, toggleTheme: () => void }
 * 
 * AR: خطاف مخصص للوصول لحالة الثيم ودالة التبديل.
 *     يرجع: { theme: 'light'|'dark', isDark: boolean, toggleTheme: () => void }
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider / يجب استخدام useTheme داخل ThemeProvider');
  }
  return context;
};
