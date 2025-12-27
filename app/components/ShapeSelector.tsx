'use client';

import React from 'react';
import { Shape, presetShapes } from './shapes';
import { useLanguage } from '../i18n/LanguageContext';

interface ShapeSelectorProps {
  selectedShape: Shape;
  onSelectShape: (shape: Shape) => void;
  onOpenCustomEditor: () => void;
}

export default function ShapeSelector({ selectedShape, onSelectShape, onOpenCustomEditor }: ShapeSelectorProps) {
  const { t } = useLanguage();
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-black">{t.chooseShape}</h3>
        <button
          onClick={onOpenCustomEditor}
          className="text-xs font-medium text-black hover:text-gray-600 transition-colors"
        >
          {t.customShape}
        </button>
      </div>
      
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {presetShapes.map((shape) => (
          <button
            key={shape.id}
            onClick={() => onSelectShape(shape)}
            className={`relative aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
              selectedShape.id === shape.id
                ? 'border-black bg-gray-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            title={shape.name}
          >
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-2"
            >
              <path
                d={shape.path}
                fill={selectedShape.id === shape.id ? '#000000' : '#9ca3af'}
                className="transition-colors"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
