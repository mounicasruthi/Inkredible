import React, { useState, useRef, useEffect } from 'react';
import { useCanvasContext } from '../contexts/CanvasContext';

interface TextInputProps {
  x: number;
  y: number;
  onComplete: (text: string) => void;
  onCancel: () => void;
}

export default function TextInput({ x, y, onComplete, onCancel }: TextInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { brushColor, fontSize } = useCanvasContext();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) {
        onComplete(text);
      } else {
        onCancel();
      }
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <textarea
      ref={inputRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => text.trim() ? onComplete(text) : onCancel()}
      className="absolute bg-transparent border-none outline-none resize-none overflow-hidden"
      style={{
        left: x + 'px',
        top: y + 'px',
        color: brushColor,
        fontSize: `${fontSize}px`,
        minWidth: '100px',
        minHeight: '1.5em'
      }}
      placeholder="Type here..."
    />
  );
}