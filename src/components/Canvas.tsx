import React, { useRef, useEffect, useState } from 'react';
import { useCanvasContext } from '../contexts/CanvasContext';
import { Tool, Pattern } from '../types';

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    currentPattern
  } = useCanvasContext();
  
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  const drawPattern = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save(); // Save current canvas state
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
        // Draw diagonal lines in both directions
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
    ctx.restore(); // Restore the canvas state
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && ctx) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        // Save the current canvas content
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, 0);
        }

        // Resize canvas
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        
        // Restore context properties
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = brushOpacity;
        
        // Restore the canvas content
        ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
        
        // Redraw pattern
        if (currentPattern !== Pattern.NONE) {
          drawPattern(ctx, rect.width, rect.height);
        }
      }
    };

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.globalAlpha = brushOpacity;
        setCtx(context);

        if (currentPattern !== Pattern.NONE) {
          drawPattern(context, rect.width, rect.height);
        }
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [brushOpacity, currentPattern, isDarkMode]);

  useEffect(() => {
    if (ctx && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height); // clear canvas before redrawing
      // Save canvas context before changing background
      ctx.save();

      // Change background color based on theme
      ctx.fillStyle = isDarkMode ? '#1a1a1a' : '#ffffff'; // dark/light mode background
      ctx.fillRect(0, 0, rect.width, rect.height); // fill background

      // Restore the context (preserving drawing state)
      ctx.restore();

      if (currentPattern !== Pattern.NONE) {
        drawPattern(ctx, rect.width, rect.height);
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
    if (ctx && canvasRef.current && history[currentHistoryIndex]) {
      const img = new Image();
      img.src = history[currentHistoryIndex].dataUrl;
      img.onload = () => {
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          ctx.clearRect(0, 0, rect.width, rect.height);
          if (currentPattern !== Pattern.NONE) {
            drawPattern(ctx, rect.width, rect.height);
          }
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
        }
      };
    }
  }, [currentHistoryIndex, history, currentPattern]);

  const getPointerPos = (e: React.TouchEvent | React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left),
      y: (clientY - rect.top)
    };
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const { x, y } = getPointerPos(e);
    setIsDrawing(true);
    setLastX(x);
    setLastY(y);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing || !ctx || !canvasRef.current) return;

    const { x, y } = getPointerPos(e);

    if (currentTool === Tool.BRUSH) {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === Tool.ERASER) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    setLastX(x);
    setLastY(y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (ctx && canvasRef.current) {
      addToHistory(ctx.canvas.toDataURL());
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onTouchStart={startDrawing}
      onMouseMove={draw}
      onTouchMove={draw}
      onMouseUp={stopDrawing}
      onTouchEnd={stopDrawing}
      className="w-full h-full cursor-pointer"
    />
  );
}
