import React from 'react';
import { 
  Pencil, 
  Eraser, 
  Download, 
  Undo2, 
  Redo2,
  Sun,
  Moon,
  Palette,
  Trash2,
  Grid,
  Circle,
  Rows3,
  Hash,
  Type,
  MousePointer
} from 'lucide-react';
import { useCanvasContext ,  PRESET_COLORS } from '../contexts/CanvasContext';
import { Tool, Pattern } from '../types';

export default function Toolbar() {

  const { 
    currentTool, setCurrentTool,
    brushSize, setBrushSize,
    brushColor, setBrushColor,
    brushOpacity, setBrushOpacity,
    isDarkMode, setIsDarkMode,
    currentPattern, setCurrentPattern,
    clearCanvas,
    undo,
    redo,
    canUndo,
    canRedo,
    fontSize,
    setFontSize
  } = useCanvasContext();

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'sketch.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const patterns = [
    { type: Pattern.NONE, icon: null, label: 'No Pattern' },
    { type: Pattern.GRID, icon: Grid, label: 'Grid' },
    { type: Pattern.DOTS, icon: Circle, label: 'Dots' },
    { type: Pattern.LINES, icon: Rows3, label: 'Lines' },
    { type: Pattern.CROSSHATCH, icon: Hash, label: 'Crosshatch' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 flex items-center gap-4 transition-all">
    <div className="flex items-center gap-3 pr-4 border-r border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setCurrentTool(Tool.CURSOR)}
        className={`toolbar-btn ${currentTool === Tool.CURSOR ? 'active' : ''}`}
        title="Cursor"
      >
        <MousePointer className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrentTool(Tool.BRUSH)}
        className={`toolbar-btn ${currentTool === Tool.BRUSH ? 'active' : ''}`}
        title="Brush"
      >
        <Pencil className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrentTool(Tool.ERASER)}
        className={`toolbar-btn ${currentTool === Tool.ERASER ? 'active' : ''}`}
        title="Eraser"
      >
        <Eraser className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrentTool(Tool.TEXT)}
        className={`toolbar-btn ${currentTool === Tool.TEXT ? 'active' : ''}`}
        title="Text"
      >
        <Type className="w-5 h-5" />
      </button>
      </div>

      <div className="flex items-center gap-4 pr-4 border-r border-gray-200 dark:border-gray-700">
        <div className="relative group">
          <button className="toolbar-btn" title="Color Palette">
            <Palette className="w-5 h-5" />
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-white dark:bg-gray-800 rounded-xl shadow-xl p-3 min-w-[240px]">
            <div className="color-grid">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setBrushColor(color)}
                  className={`color-btn ${color === brushColor ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="mt-3 px-2">
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {currentTool === Tool.TEXT ? (
          <div className="flex flex-col gap-1 min-w-[120px]">
            <label className="text-xs text-gray-500 dark:text-gray-400">Font Size</label>
            <input
              type="range"
              min="12"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="slider"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center">{fontSize}px</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1 min-w-[120px]">
            <label className="text-xs text-gray-500 dark:text-gray-400">Size</label>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="slider"
            />
          </div>
        )}

        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-xs text-gray-500 dark:text-gray-400">Opacity</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={brushOpacity}
            onChange={(e) => setBrushOpacity(Number(e.target.value))}
            className="slider"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pr-4 border-r border-gray-200 dark:border-gray-700">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`toolbar-btn ${!canUndo ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Undo"
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`toolbar-btn ${!canRedo ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Redo"
        >
          <Redo2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={clearCanvas}
          className="toolbar-btn text-red-500 hover:bg-red-50 active:bg-red-100 dark:hover:bg-red-900/20 dark:active:bg-red-900/30"
          title="Clear Canvas"
        >
          <Trash2 className="w-5 h-5" />
        </button>
        <button
          onClick={handleDownload}
          className="toolbar-btn"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </button>

        <div className="relative group">
          <button className="toolbar-btn" title="Background Pattern">
            {patterns.find(p => p.type === currentPattern)?.icon ? 
              React.createElement(patterns.find(p => p.type === currentPattern)!.icon!, { className: "w-5 h-5" }) : 
              <Grid className="w-5 h-5" />
            }
          </button>
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-white dark:bg-gray-800 rounded-xl shadow-xl p-2 min-w-[160px]">
            {patterns.map((pattern) => (
              <button
                key={pattern.type}
                onClick={() => setCurrentPattern(pattern.type)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  currentPattern === pattern.type
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {pattern.icon && <pattern.icon className="w-4 h-4" />}
                <span>{pattern.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="toolbar-btn"
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}