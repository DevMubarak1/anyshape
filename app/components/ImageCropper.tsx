'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Shape } from './shapes';
import { useLanguage } from '../i18n/LanguageContext';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ImageCropperProps {
  shape: Shape;
  customPath?: string;
}

interface Transform {
  scale: number;
  x: number;
  y: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

interface ImageItem {
  id: string;
  src: string;
  name: string;
  transform: Transform;
  history: Transform[];
  historyIndex: number;
}

interface BorderOptions {
  enabled: boolean;
  width: number;
  color: string;
}

export default function ImageCropper({ shape, customPath }: ImageCropperProps) {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [outputSize, setOutputSize] = useState(512);
  const [backgroundColor, setBackgroundColor] = useState<'transparent' | 'white' | 'black'>('transparent');
  const [isProcessing, setIsProcessing] = useState(false);
  const [borderOptions, setBorderOptions] = useState<BorderOptions>({
    enabled: false,
    width: 2,
    color: '#000000'
  });
  const [exportFormat, setExportFormat] = useState<'png' | 'svg'>('png');
  const [imageLoadTrigger, setImageLoadTrigger] = useState(0);
  const [resizeTrigger, setResizeTrigger] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});

  const currentPath = customPath || shape.path;
  const currentImage = images[currentIndex];

  const updateCurrentTransform = useCallback((newTransform: Transform, skipHistory = false) => {
    setImages(prev => prev.map((img, i) => {
      if (i === currentIndex) {
        if (skipHistory) {
          return { ...img, transform: newTransform };
        }
        const newHistory = img.history.slice(0, img.historyIndex + 1);
        newHistory.push(newTransform);
        return { 
          ...img, 
          transform: newTransform,
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
      }
      return img;
    }));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (!currentImage || currentImage.historyIndex <= 0) return;
    setImages(prev => prev.map((img, i) => {
      if (i === currentIndex && img.historyIndex > 0) {
        return {
          ...img,
          historyIndex: img.historyIndex - 1,
          transform: img.history[img.historyIndex - 1]
        };
      }
      return img;
    }));
  }, [currentImage, currentIndex]);

  const redo = useCallback(() => {
    if (!currentImage || currentImage.historyIndex >= currentImage.history.length - 1) return;
    setImages(prev => prev.map((img, i) => {
      if (i === currentIndex && img.historyIndex < img.history.length - 1) {
        return {
          ...img,
          historyIndex: img.historyIndex + 1,
          transform: img.history[img.historyIndex + 1]
        };
      }
      return img;
    }));
  }, [currentImage, currentIndex]);

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    
    const newImages: ImageItem[] = [];
    let processedCount = 0;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));

    if (imageFiles.length === 0) return;

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const initialTransform: Transform = { scale: 1, x: 0, y: 0, rotation: 0, flipH: false, flipV: false };
        newImages.push({
          id: Math.random().toString(36).substr(2, 9),
          src: event.target?.result as string,
          name: file.name.replace(/\.[^/.]+$/, ""),
          transform: initialTransform,
          history: [initialTransform],
          historyIndex: 0
        });
        
        processedCount++;
        if (processedCount === imageFiles.length) {
          setImages(prev => {
            const updated = [...prev, ...newImages];
            return updated;
          });
          // If we were empty, select the first new image
          if (images.length === 0) setCurrentIndex(0);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [images.length]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [processFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!currentImage) return;
    setIsDragging(true);
    setDragStart({ 
      x: e.clientX - currentImage.transform.x, 
      y: e.clientY - currentImage.transform.y 
    });
  }, [currentImage]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !currentImage) return;
    updateCurrentTransform({
      ...currentImage.transform,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }, true);
  }, [isDragging, dragStart, currentImage, updateCurrentTransform]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && currentImage) {
      updateCurrentTransform(currentImage.transform, false);
    }
    setIsDragging(false);
  }, [isDragging, currentImage, updateCurrentTransform]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!currentImage) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    updateCurrentTransform({
      ...currentImage.transform,
      scale: Math.max(0.1, Math.min(5, currentImage.transform.scale * delta)),
    });
  }, [currentImage, updateCurrentTransform]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!currentImage || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ 
      x: touch.clientX - currentImage.transform.x, 
      y: touch.clientY - currentImage.transform.y 
    });
  }, [currentImage]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !currentImage || e.touches.length !== 1) return;
    const touch = e.touches[0];
    updateCurrentTransform({
      ...currentImage.transform,
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  }, [isDragging, dragStart, currentImage, updateCurrentTransform]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const drawImageToCanvas = useCallback((
    ctx: CanvasRenderingContext2D, 
    img: HTMLImageElement, 
    transform: Transform,
    size: number
  ) => {
    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Set background
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, size, size);
    }

    // Calculate dimensions based on the preview container size (400px)
    const previewSize = 400;
    const scaleFactor = size / previewSize;
    
    // Base dimensions of the image if it were in the preview container
    // The image width is always 100% of container (400px) in the CSS
    const baseWidth = size; 
    const baseHeight = size * (img.height / img.width);
    
    // Calculate center position
    // transform.x/y are in preview pixels, so we scale them
    const centerX = size / 2 + transform.x * scaleFactor;
    const centerY = size / 2 + transform.y * scaleFactor;

    // Apply clipping path
    ctx.save();
    const pathData = currentPath;
    const path2D = new Path2D(pathData);
    const pathScale = size / 100;
    ctx.scale(pathScale, pathScale);
    ctx.clip(path2D);
    // Reset scale for image drawing
    ctx.scale(1/pathScale, 1/pathScale);
    
    // Apply transformations
    ctx.translate(centerX, centerY);
    ctx.rotate((transform.rotation * Math.PI) / 180);
    ctx.scale(
      transform.scale * (transform.flipH ? -1 : 1), 
      transform.scale * (transform.flipV ? -1 : 1)
    );
    
    // Draw image centered at (0,0) in the transformed context
    ctx.drawImage(img, -baseWidth / 2, -baseHeight / 2, baseWidth, baseHeight);
    
    ctx.restore();

    // Draw border if enabled
    if (borderOptions.enabled && borderOptions.width > 0) {
      ctx.save();
      ctx.scale(pathScale, pathScale);
      ctx.strokeStyle = borderOptions.color;
      ctx.lineWidth = borderOptions.width / pathScale; // Adjust line width to be consistent
      ctx.stroke(path2D);
      ctx.restore();
    }
  }, [backgroundColor, currentPath, borderOptions]);

  // Effect to load the current image
  useEffect(() => {
    if (!currentImage) return;

    const cached = imageCacheRef.current[currentImage.id];
    if (cached && cached.complete) {
      // Already loaded, but update the ref
      imageRef.current = cached;
      return;
    }

    // Load the image
    let isMounted = true;
    const img = new Image();
    img.onload = () => {
      if (!isMounted) return;
      imageCacheRef.current[currentImage.id] = img;
      imageRef.current = img;
      // Trigger re-render
      setImageLoadTrigger(prev => prev + 1);
    };
    img.src = currentImage.src;

    return () => {
      isMounted = false;
    };
  }, [currentImage]);

  // Effect to draw the preview whenever anything relevant changes
  useEffect(() => {
    console.log('Preview Effect Running', { 
      hasImage: !!currentImage, 
      hasCanvas: !!previewCanvasRef.current,
      imageId: currentImage?.id 
    });

    if (!currentImage || !previewCanvasRef.current) return;

    const cached = imageCacheRef.current[currentImage.id];
    if (!cached || !cached.complete) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerSize = previewRef.current ? previewRef.current.clientWidth : 400;
    const size = containerSize > 0 ? Math.floor(containerSize) : 400;
    
    // Resize canvas if needed (this clears the canvas)
    if (canvas.width !== size || canvas.height !== size) {
      canvas.width = size;
      canvas.height = size;
    }

    // Draw immediately
    try {
      // Reset transform to ensure we clear the whole canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      // Clear before drawing to ensure transparency works
      ctx.clearRect(0, 0, size, size);
      drawImageToCanvas(ctx, cached, currentImage.transform, size);
    } catch (e) {
      console.error("Error drawing preview:", e);
    }
  }, [currentImage, drawImageToCanvas, imageLoadTrigger, resizeTrigger]);

  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      setResizeTrigger(prev => prev + 1);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Clear canvas when no image
  useEffect(() => {
    if (currentImage) return;
    imageRef.current = null;
    const canvas = previewCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, [currentImage]);

  const downloadSingleImage = useCallback(() => {
    if (!currentImage || !imageRef.current) return;

    if (exportFormat === 'svg') {
      // SVG Export
      const scaleFactor = outputSize / 400;
      const centerX = outputSize / 2 + currentImage.transform.x * scaleFactor;
      const centerY = outputSize / 2 + currentImage.transform.y * scaleFactor;
      const baseWidth = outputSize;
      const baseHeight = outputSize * (imageRef.current ? imageRef.current.height / imageRef.current.width : 1);

      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${outputSize}" height="${outputSize}" viewBox="0 0 ${outputSize} ${outputSize}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <clipPath id="shape-clip">
      <path d="${currentPath}" transform="scale(${outputSize / 100})"/>
    </clipPath>
  </defs>
  ${backgroundColor !== 'transparent' ? `<rect width="${outputSize}" height="${outputSize}" fill="${backgroundColor}"/>` : ''}
  <g clip-path="url(#shape-clip)">
    <g transform="translate(${centerX} ${centerY}) rotate(${currentImage.transform.rotation}) scale(${currentImage.transform.scale * (currentImage.transform.flipH ? -1 : 1)} ${currentImage.transform.scale * (currentImage.transform.flipV ? -1 : 1)})">
      <image href="${currentImage.src}" x="${-baseWidth/2}" y="${-baseHeight/2}" width="${baseWidth}" height="${baseHeight}" preserveAspectRatio="none"/>
    </g>
  </g>
  ${borderOptions.enabled ? `<path d="${currentPath}" transform="scale(${outputSize / 100})" fill="none" stroke="${borderOptions.color}" stroke-width="${borderOptions.width * (100/outputSize)}"/>` : ''}
</svg>`;

      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const link = document.createElement('a');
      link.download = `anyshape-${currentImage.name}-${shape.id}.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } else {
      // PNG Export
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = outputSize;
      canvas.height = outputSize;

      drawImageToCanvas(ctx, imageRef.current, currentImage.transform, outputSize);

      const link = document.createElement('a');
      link.download = `anyshape-${currentImage.name}-${shape.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }, [currentImage, outputSize, shape.id, drawImageToCanvas, exportFormat, currentPath, backgroundColor, borderOptions]);

  const downloadAllImages = useCallback(async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder("anyshape-export");

      if (exportFormat === 'png') {
        // Create a temporary canvas for processing
        const canvas = document.createElement('canvas');
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error("Could not create canvas context");

        // Process each image
        const promises = images.map(async (imgItem) => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              drawImageToCanvas(ctx, img, imgItem.transform, outputSize);
              
              canvas.toBlob((blob) => {
                if (blob && folder) {
                  folder.file(`${imgItem.name}-${shape.id}.png`, blob);
                }
                resolve();
              }, 'image/png');
            };
            img.src = imgItem.src;
          });
        });

        await Promise.all(promises);
      } else {
        // SVG Export for all images
        const promises = images.map(async (imgItem) => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const scaleFactor = outputSize / 400;
              const centerX = outputSize / 2 + imgItem.transform.x * scaleFactor;
              const centerY = outputSize / 2 + imgItem.transform.y * scaleFactor;
              const baseWidth = outputSize;
              const baseHeight = outputSize * (img.height / img.width);

              const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${outputSize}" height="${outputSize}" viewBox="0 0 ${outputSize} ${outputSize}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <clipPath id="shape-clip">
      <path d="${currentPath}" transform="scale(${outputSize / 100})"/>
    </clipPath>
  </defs>
  ${backgroundColor !== 'transparent' ? `<rect width="${outputSize}" height="${outputSize}" fill="${backgroundColor}"/>` : ''}
  <g clip-path="url(#shape-clip)">
    <g transform="translate(${centerX} ${centerY}) rotate(${imgItem.transform.rotation}) scale(${imgItem.transform.scale * (imgItem.transform.flipH ? -1 : 1)} ${imgItem.transform.scale * (imgItem.transform.flipV ? -1 : 1)})">
      <image href="${imgItem.src}" x="${-baseWidth/2}" y="${-baseHeight/2}" width="${baseWidth}" height="${baseHeight}" preserveAspectRatio="none"/>
    </g>
  </g>
  ${borderOptions.enabled ? `<path d="${currentPath}" transform="scale(${outputSize / 100})" fill="none" stroke="${borderOptions.color}" stroke-width="${borderOptions.width * (100/outputSize)}"/>` : ''}
</svg>`;

              if (folder) {
                folder.file(`${imgItem.name}-${shape.id}.svg`, svgContent);
              }
              resolve();
            };
            img.src = imgItem.src;
          });
        });
        
        await Promise.all(promises);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "anyshape-batch-export.zip");
    } catch (error) {
      console.error("Error creating zip:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [images, outputSize, shape.id, drawImageToCanvas, exportFormat, currentPath, backgroundColor, borderOptions]);

  const resetTransform = useCallback(() => {
    if (currentImage) {
      updateCurrentTransform({ scale: 1, x: 0, y: 0, rotation: 0, flipH: false, flipV: false });
    }
  }, [currentImage, updateCurrentTransform]);

  const removeCurrentImage = useCallback(() => {
    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== currentIndex);
      if (currentIndex >= newImages.length) {
        setCurrentIndex(Math.max(0, newImages.length - 1));
      }
      return newImages;
    });
  }, [currentIndex]);

  const clearAllImages = useCallback(() => {
    setImages([]);
    setCurrentIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Hidden canvas for export */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Upload area / Preview area */}
      <div
        ref={previewRef}
        className={`relative w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden border-2 border-dashed ${
          currentImage ? 'cursor-move border-transparent' : 'cursor-pointer border-gray-300 hover:border-gray-400'
        } ${isDragging ? 'cursor-grabbing' : ''}`}
        style={{
          background: currentImage 
            ? (backgroundColor === 'transparent' 
                ? 'repeating-conic-gradient(#e5e5e5 0% 25%, white 0% 50%) 50% / 10px 10px'
                : backgroundColor)
            : '#fafafa',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !currentImage && fileInputRef.current?.click()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {!currentImage ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-black p-6">
            <svg className="w-16 h-16 mb-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium text-center text-black">{t.dropImage}</p>
            <p className="text-sm text-black mt-1">{t.orClickToBrowse}</p>
          </div>
        ) : null}
        
        {/* Canvas - always render to keep ref stable */}
        <canvas
          key={currentImage ? currentImage.id : 'empty'}
          ref={previewCanvasRef}
          className={`absolute inset-0 w-full h-full ${currentImage ? '' : 'hidden'}`}
          style={{ pointerEvents: 'none' }}
        />

        {currentImage && (
          <>
            {/* Border overlay - accurate preview of export border */}
            {borderOptions.enabled && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d={currentPath}
                  fill="none"
                  stroke={borderOptions.color}
                  strokeWidth={borderOptions.width * 0.25}
                />
              </svg>
            )}

            {/* Shape outline overlay (dashed guide) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d={currentPath}
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="0.3"
                strokeDasharray="2 2"
              />
            </svg>

            {/* Dark overlay outside shape */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <mask id="shape-mask">
                  <rect x="0" y="0" width="100" height="100" fill="white" />
                  <path d={currentPath} fill="black" />
                </mask>
              </defs>
              <rect x="0" y="0" width="100" height="100" fill="rgba(0,0,0,0.6)" mask="url(#shape-mask)" />
            </svg>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="w-full max-w-[400px] overflow-x-auto pb-2">
          <div className="flex gap-2">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  currentIndex === idx ? 'border-black ring-2 ring-black/20' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img src={img.src} alt="" className="w-full h-full object-cover" />
                {currentIndex === idx && (
                  <div className="absolute inset-0 bg-black/10" />
                )}
              </button>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 flex-shrink-0 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              title="Add more images"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      {currentImage && (
        <div className="w-full max-w-[400px] space-y-4">
          {/* Zoom slider */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-black w-14">{t.zoom}</span>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.01"
              value={currentImage.transform.scale}
              onChange={(e) => updateCurrentTransform({ ...currentImage.transform, scale: parseFloat(e.target.value) })}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <span className="text-sm text-black w-12 text-right">{Math.round(currentImage.transform.scale * 100)}%</span>
          </div>

          {/* Output size */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-black w-14">{t.size}</span>
            <select
              value={outputSize}
              onChange={(e) => setOutputSize(parseInt(e.target.value))}
              className="flex-1 h-10 px-3 bg-gray-100 rounded-lg border border-gray-200 text-sm cursor-pointer focus:outline-none focus:border-gray-400 text-black"
            >
              <option value={256}>256 × 256 px</option>
              <option value={512}>512 × 512 px</option>
              <option value={1024}>1024 × 1024 px</option>
              <option value={2048}>2048 × 2048 px</option>
            </select>
          </div>

          {/* Rotation */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-black w-14">{t.rotate}</span>
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={currentImage.transform.rotation}
              onChange={(e) => updateCurrentTransform({ ...currentImage.transform, rotation: parseFloat(e.target.value) })}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <span className="text-sm text-black w-12 text-right">{currentImage.transform.rotation}°</span>
          </div>

          {/* Flip buttons */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-black w-14">{t.flip}</span>
            <div className="flex gap-2 flex-1">
              <button
                onClick={() => updateCurrentTransform({ ...currentImage.transform, flipH: !currentImage.transform.flipH })}
                className={`flex-1 h-10 px-4 rounded-lg text-sm font-medium transition-all border ${
                  currentImage.transform.flipH 
                    ? 'bg-black text-white border-black' 
                    : 'bg-gray-100 text-black border-gray-200 hover:bg-gray-200'
                }`}
              >
                ⟷ {t.horizontal}
              </button>
              <button
                onClick={() => updateCurrentTransform({ ...currentImage.transform, flipV: !currentImage.transform.flipV })}
                className={`flex-1 h-10 px-4 rounded-lg text-sm font-medium transition-all border ${
                  currentImage.transform.flipV 
                    ? 'bg-black text-white border-black' 
                    : 'bg-gray-100 text-black border-gray-200 hover:bg-gray-200'
                }`}
              >
                ⇅ {t.vertical}
              </button>
            </div>
          </div>

          {/* Export Format */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-black w-14">{t.format}</span>
            <div className="flex gap-2 flex-1">
              <button
                onClick={() => setExportFormat('png')}
                className={`flex-1 h-10 px-4 rounded-lg text-sm font-medium transition-all border ${
                  exportFormat === 'png' 
                    ? 'bg-black text-white border-black' 
                    : 'bg-gray-100 text-black border-gray-200 hover:bg-gray-200'
                }`}
              >
                PNG
              </button>
              <button
                onClick={() => setExportFormat('svg')}
                className={`flex-1 h-10 px-4 rounded-lg text-sm font-medium transition-all border ${
                  exportFormat === 'svg' 
                    ? 'bg-black text-white border-black' 
                    : 'bg-gray-100 text-black border-gray-200 hover:bg-gray-200'
                }`}
              >
                SVG
              </button>
            </div>
          </div>

          {/* Border options */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="border-enabled"
                checked={borderOptions.enabled}
                onChange={(e) => setBorderOptions(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-4 h-4 rounded accent-black cursor-pointer"
              />
              <label htmlFor="border-enabled" className="text-sm font-medium text-black cursor-pointer flex-1">
                {t.addBorder}
              </label>
            </div>
            
            {borderOptions.enabled && (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-black w-14">{t.size}</span>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={borderOptions.width}
                    onChange={(e) => setBorderOptions(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                  <span className="text-sm text-black w-12 text-right">{borderOptions.width}px</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm text-black w-14">Color</span>
                  <input
                    type="color"
                    value={borderOptions.color}
                    onChange={(e) => setBorderOptions(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 h-10 rounded-lg cursor-pointer"
                  />
                  <span className="text-sm text-black w-20 text-right">{borderOptions.color}</span>
                </div>
              </>
            )}
          </div>

          {/* Background */}
          <div 
            className="flex flex-col gap-2 pt-4 border-t border-gray-200"
          >
            <span className="text-sm text-black font-medium">{t.background}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setBackgroundColor('transparent')}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  backgroundColor === 'transparent' 
                    ? 'border-black scale-105' 
                    : 'border-gray-300'
                }`}
                style={{
                  background: 'repeating-conic-gradient(#e5e5e5 0% 25%, white 0% 50%) 50% / 10px 10px'
                }}
                title={t.transparent}
              />
              <button
                onClick={() => setBackgroundColor('white')}
                className={`w-10 h-10 rounded-lg border-2 transition-all bg-white ${
                  backgroundColor === 'white' 
                    ? 'border-black scale-105' 
                    : 'border-gray-300'
                }`}
                title={t.white}
              />
              <button
                onClick={() => setBackgroundColor('black')}
                className={`w-10 h-10 rounded-lg border-2 transition-all bg-black ${
                  backgroundColor === 'black' 
                    ? 'border-black scale-105 ring-2 ring-gray-400' 
                    : 'border-gray-300'
                }`}
                title={t.black}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={undo}
              disabled={!currentImage || currentImage.historyIndex <= 0}
              className="h-11 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-200 text-black disabled:opacity-40 disabled:cursor-not-allowed"
              title="Undo"
            >
              ↶
            </button>
            <button
              onClick={redo}
              disabled={!currentImage || currentImage.historyIndex >= currentImage.history.length - 1}
              className="h-11 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-200 text-black disabled:opacity-40 disabled:cursor-not-allowed"
              title="Redo"
            >
              ↷
            </button>
            <button
              onClick={resetTransform}
              className="flex-1 h-11 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-200 text-black"
            >
              {t.reset}
            </button>
            <button
              onClick={images.length > 1 ? removeCurrentImage : clearAllImages}
              className="flex-1 h-11 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors border border-gray-200 text-black"
            >
              {images.length > 1 ? 'Remove' : t.clear}
            </button>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={images.length > 1 ? downloadAllImages : downloadSingleImage}
              disabled={isProcessing}
              className="flex-1 h-11 px-4 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                images.length > 1 
                  ? `Download All (${images.length})` 
                  : (exportFormat === 'png' ? t.downloadPng : t.downloadSvg)
              )}
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {currentImage && (
        <p className="text-xs text-black text-center max-w-[300px]">
          {t.dragToReposition} • {t.scrollToZoom}
        </p>
      )}
    </div>
  );
}
