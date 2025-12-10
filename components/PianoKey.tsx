import React, { useState } from 'react';
import { NoteConfig } from '../types';
import { audioService } from '../services/audioService';

interface PianoKeyProps {
  note: NoteConfig;
  octave: number;
  width: number;
}

export const PianoKey: React.FC<PianoKeyProps> = ({ note, octave, width }) => {
  const [isActive, setIsActive] = useState(false);
  const [isBlackActive, setIsBlackActive] = useState(false);

  // Maintain aspect ratio.
  const height = width * 4.5; 
  const blackWidth = width * 0.6;
  const blackHeight = height * 0.6;

  const startPlay = (e: React.MouseEvent | React.TouchEvent, isSharp: boolean) => {
    // Prevent default to avoid scrolling on touch or ghost clicks
    if (e.cancelable) e.preventDefault(); 
    e.stopPropagation();

    const noteName = isSharp ? `${note.name}#` : note.name;
    audioService.startNote(noteName, octave);

    if (isSharp) {
      setIsBlackActive(true);
    } else {
      setIsActive(true);
    }
  };

  const stopPlay = (e: React.MouseEvent | React.TouchEvent, isSharp: boolean) => {
    e.stopPropagation();
    
    const noteName = isSharp ? `${note.name}#` : note.name;
    audioService.stopNote(noteName, octave);

    if (isSharp) {
      setIsBlackActive(false);
    } else {
      setIsActive(false);
    }
  };

  // Helper to attach all necessary events for a key surface
  const getEvents = (isSharp: boolean) => ({
    onMouseDown: (e: React.MouseEvent) => startPlay(e, isSharp),
    onMouseUp: (e: React.MouseEvent) => stopPlay(e, isSharp),
    onMouseLeave: (e: React.MouseEvent) => stopPlay(e, isSharp),
    onTouchStart: (e: React.TouchEvent) => startPlay(e, isSharp),
    onTouchEnd: (e: React.TouchEvent) => stopPlay(e, isSharp),
  });

  return (
    // White Key Container
    <div 
      className={`relative border border-gray-400 rounded-b-md cursor-pointer transition-colors duration-75 select-none
        ${isActive ? 'bg-gray-300 shadow-inner' : 'bg-white shadow-md hover:bg-gray-50'}
      `}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        flexShrink: 0 
      }}
      {...getEvents(false)}
    >
      {/* Label for C notes only */}
      {note.name === 'C' && (
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-500 text-xs font-bold pointer-events-none">
          C{octave}
        </span>
      )}

      {/* Black Key (if applicable) */}
      {note.hasSharp && (
        <div
          className={`absolute z-10 top-0 border-x border-b border-black rounded-b-md cursor-pointer transition-colors duration-75
            ${isBlackActive ? 'bg-gray-700' : 'bg-black'}
          `}
          style={{
            width: `${blackWidth}px`,
            height: `${blackHeight}px`,
            left: '100%',
            transform: 'translateX(-50%)',
            boxShadow: isBlackActive ? 'inset 0 2px 5px rgba(0,0,0,0.5)' : '2px 2px 4px rgba(0,0,0,0.5)'
          }}
          // Need to stop propagation on the black key so it doesn't trigger the white key below it
          onMouseDown={(e) => { e.stopPropagation(); startPlay(e, true); }}
          onMouseUp={(e) => { e.stopPropagation(); stopPlay(e, true); }}
          onMouseLeave={(e) => { e.stopPropagation(); stopPlay(e, true); }}
          onTouchStart={(e) => { e.stopPropagation(); startPlay(e, true); }}
          onTouchEnd={(e) => { e.stopPropagation(); stopPlay(e, true); }}
        >
        </div>
      )}
    </div>
  );
};