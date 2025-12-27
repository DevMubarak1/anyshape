'use client';

import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="w-full py-8 px-4 mt-auto border-t border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-black">
            <span className="whitespace-nowrap">{t.madeWith} <span className="text-red-500">❤️</span> by</span>
            <a
              href="https://devmubarak.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-gray-700 transition-colors font-medium underline"
            >
              DevMubarak
            </a>
            <span className="hidden sm:inline">•</span>
            <span>{t.openSource}</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium">
            <a
              href="https://github.com/DevMubarak1/anyshape"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-gray-700 transition-colors flex items-center gap-2"
            >
              {t.starOnGithub} <span>⭐</span>
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="https://github.com/DevMubarak1/anyshape/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-gray-700 transition-colors"
            >
              {t.reportIssue}
            </a>
          </div>
        </div>
        
        <div className="mt-6 text-center border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            {t.footerNote}
          </p>
        </div>
      </div>
    </footer>
  );
}
