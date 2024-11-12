import React, { createContext, useContext, useState, useCallback } from 'react';
import { Tool, Pattern } from '../types';

interface CanvasHistoryState {
  dataUrl: string;
}

interface CanvasContextType {
  currentTool: Tool;
  setCurrentTool: (tool: Tool) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushOpacity: number;
  setBrushOpacity: (opacity: number) => void;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  currentPattern: Pattern;
  setCurrentPattern: (pattern: Pattern) => void;
  history: CanvasHistoryState[];
  currentHistoryIndex: number;
  addToHistory: (dataUrl: string) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  fontSize: number;
  setFontSize: (size: number) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const PRESET_COLORS = [
  '#ff9a9e', // Soft pink
  '#fad0c4', // Peach
  '#a1c4fd', // Light blue
  '#c2e9fb', // Sky blue
  '#d4fc79', // Light green
  '#96e6a1', // Mint
  '#ffecd2', // Cream
  '#fcb69f', // Coral
  '#84fab0', // Aqua
  '#8fd3f4', // Baby blue
  '#000000', // Black
  '#ffffff', // White
];

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [currentTool, setCurrentTool] = useState<Tool>(Tool.BRUSH);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPattern, setCurrentPattern] = useState<Pattern>(Pattern.NONE);
  const [history, setHistory] = useState<CanvasHistoryState[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [fontSize, setFontSize] = useState(24);

  const addToHistory = useCallback((dataUrl: string) => {
    const newHistory = [...history.slice(0, currentHistoryIndex + 1), { dataUrl }];
    setHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  }, [history, currentHistoryIndex]);

  const clearCanvas = useCallback(() => {
    const canvas = document.querySelector('canvas');
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
      addToHistory(canvas.toDataURL());
    }
  }, [addToHistory]);

  const undo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    }
  }, [currentHistoryIndex]);

  const redo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
    }
  }, [currentHistoryIndex, history.length]);

  const canUndo = currentHistoryIndex > 0;
  const canRedo = currentHistoryIndex < history.length - 1;

  return (
    <CanvasContext.Provider
      value={{
        currentTool,
        setCurrentTool,
        brushSize,
        setBrushSize,
        brushColor,
        setBrushColor,
        brushOpacity,
        setBrushOpacity,
        isDrawing,
        setIsDrawing,
        isDarkMode,
        setIsDarkMode,
        currentPattern,
        setCurrentPattern,
        history,
        currentHistoryIndex,
        addToHistory,
        clearCanvas,
        undo,
        redo,
        canUndo,
        canRedo,
        fontSize,
        setFontSize
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvasContext() {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return context;
}