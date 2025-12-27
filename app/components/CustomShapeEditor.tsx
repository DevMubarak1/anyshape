'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Shape, generatePolygonPath, generateStarPath } from './shapes';
import { useLanguage } from '../i18n/LanguageContext';

interface CustomShapeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveShape: (shape: Shape) => void;
  savedCustomShapes: Shape[];
  onDeleteCustomShape: (shapeId: string) => void;
}

type EditorMode = 'generator' | 'svg' | 'draw';

export default function CustomShapeEditor({
  isOpen,
  onClose,
  onSaveShape,
  savedCustomShapes,
  onDeleteCustomShape,
}: CustomShapeEditorProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<EditorMode>('generator');
  const [shapeName, setShapeName] = useState('Custom Shape');
  
  const [shapeType, setShapeType] = useState<'polygon' | 'star'>('polygon');
  const [sides, setSides] = useState(6);
  const [starPoints, setStarPoints] = useState(5);
  const [innerRadius, setInnerRadius] = useState(0.4);
  const [rotation, setRotation] = useState(-90);
  
  const [svgPath, setSvgPath] = useState('');
  const [svgError, setSvgError] = useState('');
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<SVGSVGElement>(null);

  const getGeneratedPath = useCallback(() => {
    if (shapeType === 'polygon') {
      return generatePolygonPath(sides, rotation);
    } else {
      return generateStarPath(starPoints, innerRadius);
    }
  }, [shapeType, sides, starPoints, innerRadius, rotation]);

  const getPreviewPath = useCallback(() => {
    switch (mode) {
      case 'generator':
        return getGeneratedPath();
      case 'svg':
        return svgPath || 'M 50 0 A 50 50 0 1 1 50 100 A 50 50 0 1 1 50 0 Z';
      case 'draw':
        if (drawPoints.length < 3) return '';
        return `M ${drawPoints.map(p => `${p.x} ${p.y}`).join(' L ')} Z`;
      default:
        return '';
    }
  }, [mode, getGeneratedPath, svgPath, drawPoints]);

  const handleSave = useCallback(() => {
    const path = getPreviewPath();
    if (!path) {
      setSvgError(t.createValidShape);
      return;
    }

    const newShape: Shape = {
      id: `custom-${Date.now()}`,
      name: shapeName || 'Custom Shape',
      path,
      icon: '',
    };

    onSaveShape(newShape);
    onClose();
  }, [getPreviewPath, shapeName, onSaveShape, onClose, t]);

  const handleDrawStart = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== 'draw') return;
    
    const svg = canvasRef.current;
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setIsDrawing(true);
    setDrawPoints([{ x, y }]);
  }, [mode]);

  const handleDrawMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || mode !== 'draw') return;
    
    const svg = canvasRef.current;
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setDrawPoints(prev => [...prev, { x, y }]);
  }, [isDrawing, mode]);

  const handleTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (mode !== 'draw') return;
    
    const svg = canvasRef.current;
    if (!svg) return;
    
    const touch = e.touches[0];
    const rect = svg.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    
    setIsDrawing(true);
    setDrawPoints([{ x, y }]);
    // Prevent scrolling while drawing
    e.preventDefault();
  }, [mode]);

  const handleTouchMove = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (!isDrawing || mode !== 'draw') return;
    
    const svg = canvasRef.current;
    if (!svg) return;
    
    const touch = e.touches[0];
    const rect = svg.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    
    setDrawPoints(prev => [...prev, { x, y }]);
    // Prevent scrolling while drawing
    e.preventDefault();
  }, [isDrawing, mode]);

  const handleDrawEnd = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearDrawing = useCallback(() => {
    setDrawPoints([]);
  }, []);

  const validateSvgPath = useCallback((path: string) => {
    try {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('d', path);
      svg.appendChild(pathElement);
      
      const length = pathElement.getTotalLength();
      if (isNaN(length) || length === 0) {
        throw new Error('Invalid path');
      }
      
      setSvgError('');
      return true;
    } catch {
      setSvgError(t.invalidPath);
      return false;
    }
  }, [t]);

  const handleSvgPathChange = useCallback((value: string) => {
    setSvgPath(value);
    if (value.trim()) {
      validateSvgPath(value);
    } else {
      setSvgError('');
    }
  }, [validateSvgPath]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-black">{t.customShapeEditor}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-black hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Mode tabs */}
          <div className="flex gap-2 mb-4">
            {[
              { id: 'generator', label: t.generator, icon: '' },
              { id: 'svg', label: t.svgPath, icon: '' },
              { id: 'draw', label: t.draw, icon: '' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id as EditorMode)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  mode === tab.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-black'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Controls */}
            <div className="space-y-4">
              {/* Shape name */}
              <div>
                <label className="block text-sm font-medium mb-1 text-black">{t.shapeName}</label>
                <input
                  type="text"
                  value={shapeName}
                  onChange={(e) => setShapeName(e.target.value)}
                  className="w-full h-10 px-3 bg-gray-100 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 text-black"
                  placeholder={t.enterShapeName}
                />
              </div>

              {/* Generator mode controls */}
              {mode === 'generator' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-black">{t.shapeType}</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShapeType('polygon')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          shapeType === 'polygon'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 border border-gray-200 text-black'
                        }`}
                      >
                        {t.polygon}
                      </button>
                      <button
                        onClick={() => setShapeType('star')}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          shapeType === 'star'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 border border-gray-200 text-black'
                        }`}
                      >
                        {t.star}
                      </button>
                    </div>
                  </div>

                  {shapeType === 'polygon' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-black">{t.sides}: {sides}</label>
                        <input
                          type="range"
                          min="3"
                          max="12"
                          value={sides}
                          onChange={(e) => setSides(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-black">{t.rotation}: {rotation}</label>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={rotation}
                          onChange={(e) => setRotation(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                      </div>
                    </>
                  )}

                  {shapeType === 'star' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-black">{t.points}: {starPoints}</label>
                        <input
                          type="range"
                          min="3"
                          max="12"
                          value={starPoints}
                          onChange={(e) => setStarPoints(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-black">{t.innerRadius}: {Math.round(innerRadius * 100)}%</label>
                        <input
                          type="range"
                          min="0.1"
                          max="0.9"
                          step="0.05"
                          value={innerRadius}
                          onChange={(e) => setInnerRadius(parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* SVG mode controls */}
              {mode === 'svg' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-black">{t.svgPathData}</label>
                  <textarea
                    value={svgPath}
                    onChange={(e) => handleSvgPathChange(e.target.value)}
                    className="w-full h-32 p-3 bg-gray-100 rounded-lg border border-gray-200 text-sm font-mono resize-none focus:outline-none focus:border-gray-400 text-black"
                    placeholder={t.svgPathPlaceholder}
                  />
                  {svgError && (
                    <p className="text-red-500 text-xs mt-1">{svgError}</p>
                  )}
                  <p className="text-xs text-black mt-2">
                    {t.svgPathHint}
                  </p>
                </div>
              )}

              {/* Draw mode controls */}
              {mode === 'draw' && (
                <div>
                  <p className="text-sm text-black mb-2">
                    {t.drawInstructions}
                  </p>
                  <button
                    onClick={clearDrawing}
                    className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-200 text-black"
                  >
                    {t.clearDrawing}
                  </button>
                </div>
              )}

              {/* Saved custom shapes */}
              {savedCustomShapes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-black">{t.savedCustomShapes}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {savedCustomShapes.map((shape) => (
                      <div
                        key={shape.id}
                        className="relative group aspect-square rounded-lg border border-gray-200 bg-white"
                      >
                        <svg viewBox="0 0 100 100" className="absolute inset-1">
                          <path d={shape.path} fill="#9ca3af" />
                        </svg>
                        <button
                          onClick={() => onDeleteCustomShape(shape.id)}
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

            {/* Preview */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium mb-2 self-start text-black">{t.preview}</label>
              <svg
                ref={canvasRef}
                viewBox="0 0 100 100"
                className={`w-full aspect-square bg-gray-100 rounded-xl ${
                  mode === 'draw' ? 'cursor-crosshair' : ''
                }`}
                onMouseDown={handleDrawStart}
                onMouseMove={handleDrawMove}
                onMouseUp={handleDrawEnd}
                onMouseLeave={handleDrawEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleDrawEnd}
              >
                {/* Grid */}
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e5e5" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
                
                {/* Shape preview */}
                {getPreviewPath() && (
                  <path
                    d={getPreviewPath()}
                    fill="rgba(0, 0, 0, 0.1)"
                    stroke="#000000"
                    strokeWidth="1"
                  />
                )}
                
                {/* Drawing points */}
                {mode === 'draw' && drawPoints.map((point, i) => (
                  <circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r="1"
                    fill="#000000"
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-200 text-black"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {t.useThisShape}
          </button>
        </div>
      </div>
    </div>
  );
}
