import React, { useRef, useEffect, useState } from 'react';
import { useCanvasContext } from '../contexts/CanvasContext';
import { Tool, Pattern } from '../types';
import TextInput from './TextInput';

interface TextBox {
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

export default function Canvas() {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const fgCanvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    currentTool,
    brushSize,
    brushColor,
    brushOpacity,
    isDrawing,
    setIsDrawing,
    history,
    currentHistoryIndex,
    addToHistory,
    isDarkMode,
    currentPattern,
    fontSize
  } = useCanvasContext();
  
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [isAddingText, setIsAddingText] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });

  const drawPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    // Set background color based on theme
    ctx.fillStyle = isDarkMode ? '#111827' : '#f9fafb';
    ctx.fillRect(0, 0, width, height);
    
    if (currentPattern === Pattern.NONE) return;

    ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;

    switch (currentPattern) {
      case Pattern.GRID:
        const gridSize = 20;
        for (let x = 0; x <= width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y <= height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        break;

      case Pattern.DOTS:
        const dotSpacing = 20;
        const dotRadius = 1;

        ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';

        for (let x = dotSpacing; x < width; x += dotSpacing) {
          for (let y = dotSpacing; y < height; y += dotSpacing) {
            ctx.beginPath();
            ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;

      case Pattern.LINES:
        const lineSpacing = 20;
        for (let y = 0; y <= height; y += lineSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        break;

      case Pattern.CROSSHATCH:
        const spacing = 20;
        for (let x = -height; x < width; x += spacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x + height, height);
          ctx.stroke();
        }
        for (let x = -height; x < width; x += spacing) {
          ctx.beginPath();
          ctx.moveTo(x, height);
          ctx.lineTo(x + height, 0);
          ctx.stroke();
        }
        break;
    }
  };

  const setupCanvas = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    return { width: rect.width, height: rect.height };
  };

  useEffect(() => {
    const handleResize = () => {
      if (bgCanvasRef.current && fgCanvasRef.current) {
        const bgCtx = bgCanvasRef.current.getContext('2d');
        const fgCtx = fgCanvasRef.current.getContext('2d');
        
        if (bgCtx && fgCtx) {
          // Save foreground content
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCanvas.width = fgCanvasRef.current.width;
            tempCanvas.height = fgCanvasRef.current.height;
            tempCtx.drawImage(fgCanvasRef.current, 0, 0);
          }

          // Resize and setup both canvases
          const { width, height } = setupCanvas(bgCanvasRef.current, bgCtx);
          setupCanvas(fgCanvasRef.current, fgCtx);
          
          // Redraw background
          drawPattern(bgCtx, width, height);
          
          // Restore foreground content
          if (tempCtx) {
            fgCtx.drawImage(tempCanvas, 0, 0, width, height);
          }
          
          setCtx(fgCtx);
        }
      }
    };

    // Initial setup
    if (bgCanvasRef.current && fgCanvasRef.current) {
      const bgCtx = bgCanvasRef.current.getContext('2d');
      const fgCtx = fgCanvasRef.current.getContext('2d');
      
      if (bgCtx && fgCtx) {
        const { width, height } = setupCanvas(bgCanvasRef.current, bgCtx);
        setupCanvas(fgCanvasRef.current, fgCtx);
        drawPattern(bgCtx, width, height);
        setCtx(fgCtx);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {  // Update background when pattern or theme changes
    if (bgCanvasRef.current) {
      const bgCtx = bgCanvasRef.current.getContext('2d');
      if (bgCtx) {
        const rect = bgCanvasRef.current.getBoundingClientRect();
        drawPattern(bgCtx, rect.width, rect.height);
      }
    }
  }, [currentPattern, isDarkMode]);

  useEffect(() => {
    if (ctx) {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.globalAlpha = brushOpacity;
    }
  }, [brushColor, brushSize, brushOpacity, ctx]);

  useEffect(() => {
    if (ctx && fgCanvasRef.current && history[currentHistoryIndex]) {
      const img = new Image();
      img.src = history[currentHistoryIndex].dataUrl;
      img.onload = () => {
        if (fgCanvasRef.current) {
          const rect = fgCanvasRef.current.getBoundingClientRect();
          ctx.clearRect(0, 0, rect.width, rect.height);
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
        }
      };
    }
  }, [currentHistoryIndex, history]);

  const getPointerPos = (e: React.TouchEvent | React.MouseEvent) => {
    const rect = fgCanvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left),
      y: (clientY - rect.top)
    };
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (currentTool === Tool.TEXT && !isAddingText) {
      const { x, y } = getPointerPos(e);
      setTextPosition({ x, y });
      setIsAddingText(true);
    }
  };

  const handleTextComplete = (text: string) => {
    if (ctx) {
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = brushColor;
      ctx.globalAlpha = brushOpacity;
      ctx.fillText(text, textPosition.x, textPosition.y);
      setIsAddingText(false);
      if (fgCanvasRef.current) {
        addToHistory(fgCanvasRef.current.toDataURL());
      }
    }
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    if (currentTool === Tool.TEXT || currentTool === Tool.CURSOR) return;

    e.preventDefault();
    const { x, y } = getPointerPos(e);
    setIsDrawing(true);
    setLastX(x);
    setLastY(y);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (currentTool === Tool.TEXT || currentTool === Tool.CURSOR) return;

    e.preventDefault();
    if (!isDrawing || !ctx || !fgCanvasRef.current) return;

    const { x, y } = getPointerPos(e);

    if (currentTool === Tool.BRUSH) {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === Tool.ERASER) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }

    setLastX(x);
    setLastY(y);
  };

  const stopDrawing = () => {
    if (isDrawing && fgCanvasRef.current) {
      setIsDrawing(false);
      addToHistory(fgCanvasRef.current.toDataURL());
    }
  };

  return (
    <>
      <canvas
        ref={bgCanvasRef}
        className="absolute inset-0 touch-none"
        style={{ width: '100%', height: '100%' }}
      />
      <canvas
          ref={fgCanvasRef}
        className={`absolute inset-0 touch-none ${
          currentTool === Tool.TEXT 
            ? 'cursor-text' 
            : currentTool === Tool.BRUSH 
              ? 'cursor-brush' 
              : currentTool === Tool.ERASER
                ? 'cursor-eraser'
                : 'cursor-default'
        }`}
        style={{ width: '100%', height: '100%' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onClick={handleCanvasClick}
      />
       {isAddingText && (
        <TextInput
          x={textPosition.x}
          y={textPosition.y}
          onComplete={handleTextComplete}
          onCancel={() => setIsAddingText(false)}
        />
       )}
    </>
  );
}
