import React, { useState } from 'react';
import { PianoInstance } from './types';
import { PianoWindow } from './components/PianoWindow';

const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  const [keyboards, setKeyboards] = useState<PianoInstance[]>([
    { id: generateId(), name: '钢琴1', x: 100, y: 150, zIndex: 1, startOctave: 3, endOctave: 4, scale: 40 }
  ]);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [nextPianoIndex, setNextPianoIndex] = useState(2);

  const addKeyboard = () => {
    const newZ = maxZIndex + 1;
    setMaxZIndex(newZ);
    setKeyboards([
      ...keyboards,
      { 
        id: generateId(), 
        name: `钢琴${nextPianoIndex}`,
        x: 50 + (keyboards.length * 30), 
        y: 100 + (keyboards.length * 30), 
        zIndex: newZ,
        startOctave: 3, 
        endOctave: 4,
        scale: 40
      }
    ]);
    setNextPianoIndex(prev => prev + 1);
  };

  const resetDesktop = () => {
    const newZ = 1;
    setMaxZIndex(newZ);
    setKeyboards([
      { id: generateId(), name: '钢琴1', x: 100, y: 150, zIndex: newZ, startOctave: 3, endOctave: 4, scale: 40 }
    ]);
    setNextPianoIndex(2);
  };

  const removeKeyboard = (id: string) => {
    setKeyboards(keyboards.filter(k => k.id !== id));
  };

  const updateKeyboard = (id: string, updates: Partial<PianoInstance>) => {
    setKeyboards(keyboards.map(k => k.id === id ? { ...k, ...updates } : k));
  };

  const bringToFront = (id: string) => {
    const target = keyboards.find(k => k.id === id);
    if (target && target.zIndex !== maxZIndex) {
      const newZ = maxZIndex + 1;
      setMaxZIndex(newZ);
      updateKeyboard(id, { zIndex: newZ });
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-900 font-sans select-none">
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black"></div>
      </div>

      {/* Main UI Layer */}
      <div className="relative z-0 w-full h-full">
        
        {/* Top Control Bar (Fixed) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-slate-700 flex items-center gap-6 z-[9999]">
          
          <h1 className="text-slate-200 font-bold tracking-wider mr-2">简易钢琴键盘</h1>

          <div className="h-6 w-px bg-slate-600"></div>

          <div className="flex items-center gap-3">
             <button 
                onClick={addKeyboard}
                className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold py-1.5 px-4 rounded-full shadow transition-all flex items-center gap-2"
             >
                <span className="text-xl leading-none">+</span> 新建键盘
             </button>
             
             <button 
                onClick={resetDesktop}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-1.5 px-4 rounded-full shadow transition-all"
             >
                重置桌面
             </button>

             <span className="text-slate-400 text-sm ml-2">{keyboards.length} 个窗口</span>
          </div>
        </div>

        {/* Floating Windows Area */}
        {keyboards.map(piano => (
          <PianoWindow 
            key={piano.id}
            data={piano}
            onUpdate={updateKeyboard}
            onClose={removeKeyboard}
            onFocus={bringToFront}
          />
        ))}

        {/* Instructions */}
        {keyboards.length === 0 && (
           <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-500">
              <p className="text-xl mb-4">暂无键盘窗口</p>
              <div className="flex gap-4">
                <button onClick={addKeyboard} className="text-indigo-400 underline hover:text-indigo-300">新建键盘</button>
                <button onClick={resetDesktop} className="text-indigo-400 underline hover:text-indigo-300">恢复默认</button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default App;