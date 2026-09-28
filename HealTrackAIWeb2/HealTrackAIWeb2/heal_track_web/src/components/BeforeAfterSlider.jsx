import React, { useState } from 'react';
import { ShieldCheck, Flame, Sliders } from 'lucide-react';

function BeforeAfterSlider({ isHC }) {
  const [sliderVal, setSliderVal] = useState(50); // 0 to 100

  return (
    <div className={`p-4 bg-white dark:bg-slate-800/40 rounded-2xl border border-gray-100 dark:border-slate-800 ${isHC ? 'thick-border' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-sm text-gray-500 dark:text-gray-400">Progression comparison</h4>
        <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
          <Sliders className="w-3.5 h-3.5" />
          Drag slider to slide view
        </span>
      </div>

      {/* Comparison Container */}
      <div className="relative h-44 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden select-none">
        
        {/* Left Side: Day 1 Baseline (Red hues representing inflammation) */}
        <div className="absolute inset-0 bg-red-50 dark:bg-red-950/20 flex items-center justify-center p-4">
          <div className="text-center">
            <Flame className="w-10 h-10 text-red-500 mx-auto mb-2 animate-pulse" />
            <h5 className="font-bold text-sm text-red-900 dark:text-red-300">Day 1: Post-Op Wound</h5>
            <p className="text-[11px] text-red-700 dark:text-red-400 mt-1">High Inflammation. Redness: 72%.</p>
            <span className="inline-block mt-2 text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">15% Healed</span>
          </div>
        </div>

        {/* Right Side: Day 14 Healed (Green hues, clipped based on slider val) */}
        <div 
          className="absolute inset-0 bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center p-4 transition-all duration-75"
          style={{ clipPath: `polygon(${sliderVal}% 0, 100% 0, 100% 100%, ${sliderVal}% 100%)` }}
        >
          <div className="text-center">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2 animate-bounce" />
            <h5 className="font-bold text-sm text-emerald-900 dark:text-emerald-300">Day 14: Closed Incision</h5>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">Sutures Dissolved. Dry Scar.</p>
            <span className="inline-block mt-2 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">82% Healed</span>
          </div>
        </div>

        {/* Center sliding border line indicator */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500 pointer-events-none z-10"
          style={{ left: `${sliderVal}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-500 border-2 border-white flex items-center justify-center shadow-md">
            <span className="text-[9px] text-white font-bold">&lt;&gt;</span>
          </div>
        </div>
      </div>

      {/* Controller Slider input */}
      <div className="mt-4 flex items-center gap-4">
        <span className="text-xs font-bold text-red-600">Day 1</span>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={sliderVal} 
          onChange={(e) => setSliderVal(Number(e.target.value))}
          className="flex-1 accent-blue-600 cursor-pointer h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none"
        />
        <span className="text-xs font-bold text-emerald-600">Day 14</span>
      </div>
    </div>
  );
}

export default BeforeAfterSlider;
