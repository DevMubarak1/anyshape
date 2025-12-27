'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ShapeSelector from './components/ShapeSelector';
import ImageCropper from '@/app/components/ImageCropper';
import CustomShapeEditor from '@/app/components/CustomShapeEditor';
import { Shape, presetShapes } from '@/app/components/shapes';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

const STORAGE_KEY = 'anyshape-custom-shapes';

function HomeContent() {
  const { t } = useLanguage();
  const [selectedShape, setSelectedShape] = useState<Shape>(presetShapes[0]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [customShapes, setCustomShapes] = useState<Shape[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const loaded = JSON.parse(saved);
          if (Array.isArray(loaded) && loaded.length > 0) {
            // eslint-disable-next-line
            setCustomShapes(loaded);
          }
        } catch (e) {
          console.error('Failed to load custom shapes:', e);
        }
      }
    }
  }, []);

  const [customPath, setCustomPath] = useState<string | undefined>(undefined);

  const saveCustomShapes = useCallback((shapes: Shape[]) => {
    setCustomShapes(shapes);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shapes));
    }
  }, []);

  const handleSelectShape = useCallback((shape: Shape) => {
    setSelectedShape(shape);
    setCustomPath(undefined);
  }, []);

  const handleSaveCustomShape = useCallback((shape: Shape) => {
    const newShapes = [...customShapes, shape];
    saveCustomShapes(newShapes);
    setSelectedShape(shape);
    setCustomPath(shape.path);
  }, [customShapes, saveCustomShapes]);

  const handleDeleteCustomShape = useCallback((shapeId: string) => {
    const newShapes = customShapes.filter(s => s.id !== shapeId);
    saveCustomShapes(newShapes);
    if (selectedShape.id === shapeId) {
      setSelectedShape(presetShapes[0]);
      setCustomPath(undefined);
    }
  }, [customShapes, saveCustomShapes, selectedShape]);

  const handleSelectCustomShape = useCallback((shape: Shape) => {
    setSelectedShape(shape);
    setCustomPath(shape.path);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-black">
            {t.heroTitle}
          </h2>
          <p className="text-black max-w-xl mx-auto">
            {t.heroSubtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr,1.2fr] gap-8 items-start">
          <div className="space-y-6">
            <ShapeSelector
              selectedShape={selectedShape}
              onSelectShape={handleSelectShape}
              onOpenCustomEditor={() => setIsEditorOpen(true)}
            />

            {customShapes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-black mb-3">
                  {t.yourCustomShapes}
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-4 gap-2">
                  {customShapes.map((shape) => (
                    <div
                      key={shape.id}
                      onClick={() => handleSelectCustomShape(shape)}
                      className={`relative aspect-square rounded-lg border-2 transition-all hover:scale-105 group cursor-pointer ${
                        selectedShape.id === shape.id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      title={shape.name}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleSelectCustomShape(shape);
                        }
                      }}
                    >
                      <svg viewBox="0 0 100 100" className="absolute inset-2">
                        <path
                          d={shape.path}
                          fill={selectedShape.id === shape.id ? '#000000' : '#9ca3af'}
                          className="transition-colors"
                        />
                      </svg>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomShape(shape.id);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <ImageCropper key={selectedShape.id} shape={selectedShape} customPath={customPath} />
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-4">
                {t.howItWorks}
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    step: '1',
                    title: t.step1Title,
                    description: t.step1Desc,
                  },
                  {
                    step: '2',
                    title: t.step2Title,
                    description: t.step2Desc,
                  },
                  {
                    step: '3',
                    title: t.step3Title,
                    description: t.step3Desc,
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-black text-white font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                      {item.step}
                    </div>
                    <h4 className="font-medium mb-1 text-black text-sm">{item.title}</h4>
                    <p className="text-xs text-black">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-4">{t.features}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { 
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    ), 
                    title: '16+ Shapes', 
                    desc: t.feature1 
                  },
                  { 
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    ), 
                    title: 'Custom Editor', 
                    desc: t.feature2 
                  },
                  { 
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    ), 
                    title: 'Privacy First', 
                    desc: t.feature3 
                  },
                  { 
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ), 
                    title: 'High Quality', 
                    desc: t.feature4 
                  },
                  { 
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ), 
                    title: 'SVG Support', 
                    desc: t.feature5 
                  },
                  { 
                    icon: (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ), 
                    title: '100% Free', 
                    desc: t.feature6 
                  },
                ].map((feature, i) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="text-black mb-2">{feature.icon}</div>
                    <h4 className="font-semibold text-black text-sm mb-1">{feature.title}</h4>
                    <p className="text-xs text-black">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 text-black">
              <h3 className="text-lg font-semibold text-black mb-4">{t.whyUseTitle}</h3>
                <p>
                  {t.whyUseDesc}
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>{t.whyUseItem1Title}</strong> {t.whyUseItem1Desc}</li>
                  <li><strong>{t.whyUseItem2Title}</strong> {t.whyUseItem2Desc}</li>
                  <li><strong>{t.whyUseItem3Title}</strong> {t.whyUseItem3Desc}</li>
                </ul>
              </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-black mb-4">{t.faqTitle}</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-black text-sm mb-1">{t.faq1Title}</h4>
                  <p className="text-sm text-black">{t.faq1Desc}</p>
                </div>
                <div>
                  <h4 className="font-medium text-black text-sm mb-1">{t.faq2Title}</h4>
                  <p className="text-sm text-black">{t.faq2Desc}</p>
                </div>
                <div>
                  <h4 className="font-medium text-black text-sm mb-1">{t.faq3Title}</h4>
                  <p className="text-sm text-black">{t.faq3Desc}</p>
                </div>
                <div>
                  <h4 className="font-medium text-black text-sm mb-1">{t.faq4Title}</h4>
                  <p className="text-sm text-black">{t.faq4Desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <CustomShapeEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaveShape={handleSaveCustomShape}
        savedCustomShapes={customShapes}
        onDeleteCustomShape={handleDeleteCustomShape}
      />
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <HomeContent />
    </LanguageProvider>
  );
}
