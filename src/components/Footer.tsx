import React from 'react';

export const Footer = () => {
  return (
    <footer className="h-12 bg-white border-t border-slate-100 flex items-center justify-center text-slate-400 text-sm">
      <p>© {new Date().getFullYear()} مستشفى برج الأطباء - جميع الحقوق محفوظة</p>
    </footer>
  );
};
