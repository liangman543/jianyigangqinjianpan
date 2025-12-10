import React, { useState, useEffect, useRef } from 'react';
import { PianoInstance, NOTES } from '../types';
import { PianoKey } from './PianoKey';

interface PianoWindowProps {
  data: PianoInstance;
  onUpdate: (id: string, updates: Partial<PianoInstance>) => void;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
}

export const PianoWindow: React.FC<PianoWindowProps> = ({ 
  data, 
  onUpdate, 
  onClose, 
  onFocus 
}) => {
  // Use ref for direct DOM manipulation during drag for maximum smoothness (60fps+)
  const windowRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number, y: number } | null>(null);
  const initialWindowPos = useRef<{ x: number, y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sync prop changes to DOM style if not dragging
  useEffect(() => {
    if (!isDragging && windowRef.current) {
      windowRef.current.style.left = `${data.x}px`;
      windowRef.current.style.top = `${data.y}px`;
    }
  }, [data.x, data.y, isDragging]);

  // Handle Dragging via Window events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStartPos.current || !initialWindowPos.current || !windowRef.current) return;
      
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      
      const newX = initialWindowPos.current.x + dx;
      const newY = initialWindowPos.current.y + dy;

      // Direct DOM update avoids React render cycle overhead during drag
      windowRef.current.style.left = `${newX}px`;
      windowRef.current.style.top = `${newY}px`;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging && dragStartPos.current && initialWindowPos.current) {
        setIsDragging(false);
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        onUpdate(data.id, { 
          x: initialWindowPos.current.x + dx, 
          y: initialWindowPos.current.y + dy 
        });
        dragStartPos.current = null;
        initialWindowPos.current = null;
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, data.id, onUpdate]);

  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    onFocus(data.id); // Bring to front
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialWindowPos.current = { x: data.x, y: data.y };
  };

  const handleOctaveChange = (delta: number, isStart: boolean) => {
    if (isStart) {
      const newStart = data.startOctave + delta;
      if (newStart < 0 || newStart >= data.endOctave) return; 
      onUpdate(data.id, { startOctave: newStart });
    } else {
      const newEnd = data.endOctave + delta;
      if (newEnd > 8 || newEnd <= data.startOctave) return;
      onUpdate(data.id, { endOctave: newEnd });
    }
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(data.id, { scale: Number(e.target.value) });
  };

  const renderKeys = () => {
    const keys = [];
    for (let o = data.startOctave; o <= data.endOctave; o++) {
      NOTES.forEach((note, index) => {
        const keyId = `${data.id}-${note.name}-${o}`;
        keys.push(
          <PianoKey 
            key={keyId} 
            note={note} 
            octave={o} 
            width={data.scale} 
          />
        );
      });
    }
    return keys;
  };

  return (
    <div
      ref={windowRef}
      className="absolute bg-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col border border-slate-600"
      style={{
        zIndex: data.zIndex,
        minWidth: '320px', 
        willChange: 'left, top'
      }}
      onMouseDown={() => onFocus(data.id)}
    >
      {/* Title Bar / Drag Handle */}
      <div 
        className={`h-11 px-3 flex items-center justify-between cursor-move select-none transition-colors ${
          isDragging ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-650'
        }`}
        onMouseDown={startDrag}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm text-slate-100 flex items-center gap-1">
            🎹 {data.name}
          </span>
          {/* Individual Scale Slider */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded px-2 py-0.5" onMouseDown={(e) => e.stopPropagation()}>
            <span className="text-[10px] text-slate-300">大小</span>
            <input 
              type="range" 
              min="20" 
              max="60" 
              value={data.scale} 
              onChange={handleScaleChange}
              className="w-16 h-1 bg-slate-500 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onClose(data.id); }}
          className="text-slate-400 hover:text-red-400 transition-colors p-1"
          title="关闭"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>
      </div>

      {/* Controls & Keyboard Container */}
      <div className="p-3 bg-slate-800">
        <div className="flex items-center justify-center gap-2">
          
          {/* Left Expand/Collapse */}
          <div className="flex flex-col gap-1">
             <button 
              onClick={() => handleOctaveChange(-1, true)} 
              className="bg-slate-700 hover:bg-indigo-600 text-white rounded w-6 h-6 flex items-center justify-center text-xs"
              title="添加低八度"
            >
              +
            </button>
            <button 
              onClick={() => handleOctaveChange(1, true)} 
              className="bg-slate-700 hover:bg-red-500 text-white rounded w-6 h-6 flex items-center justify-center text-xs"
              title="移除低八度"
            >
              -
            </button>
          </div>

          {/* The Keyboard Strip */}
          <div className="bg-slate-900 p-2 rounded-md shadow-inner overflow-x-auto overflow-y-hidden no-scrollbar max-w-[80vw]">
             <div className="flex relative">
                {renderKeys()}
             </div>
          </div>

          {/* Right Expand/Collapse */}
          <div className="flex flex-col gap-1">
             <button 
              onClick={() => handleOctaveChange(1, false)} 
              className="bg-slate-700 hover:bg-indigo-600 text-white rounded w-6 h-6 flex items-center justify-center text-xs"
              title="添加高八度"
            >
              +
            </button>
            <button 
              onClick={() => handleOctaveChange(-1, false)} 
              className="bg-slate-700 hover:bg-red-500 text-white rounded w-6 h-6 flex items-center justify-center text-xs"
              title="移除高八度"
            >
              -
            </button>
          </div>

        </div>
        <div className="text-center mt-1">
           <span className="text-[10px] text-slate-500">音域: {data.startOctave} - {data.endOctave} 八度</span>
        </div>
      </div>
    </div>
  );
};