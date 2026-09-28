import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Activity, ShieldAlert, Cpu } from 'lucide-react';

const pipelineSteps = [
  { label: 'Uploading & Encrypting Image (AES-256)...', progress: 12 },
  { label: 'Preprocessing (Grayscale & Bilateral Blur)...', progress: 28 },
  { label: 'Contrast Enhancement (CLAHE Equalization)...', progress: 42 },
  { label: 'YOLOv8 Detection (Localizing Wound Incision)...', progress: 58 },
  { label: 'OpenCV Boundary Segmentation (Contouring)...', progress: 72 },
  { label: 'CNN Feature Extraction (Bacterial Check)...', progress: 85 },
  { label: 'EfficientNet-B0 Classification & Forecast...', progress: 100 }
];

function AICognitivePipeline({ onComplete, isHC }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logMessages, setLogMessages] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < pipelineSteps.length - 1) {
          const nextIndex = prev + 1;
          setProgress(pipelineSteps[nextIndex].progress);
          setLogMessages(old => [...old, `[OK] ${pipelineSteps[prev].label}`]);
          return nextIndex;
        } else {
          // Animation has reached the final step. This component is purely a
          // visual progress indicator - it must NOT invent its own diagnostic
          // result. The real report comes from the actual image analysis
          // (handleRealScan in PatientDashboard), which calls onComplete with
          // the true risk level once it resolves. If that takes longer than
          // this animation, we just hold here at 100% instead of faking data.
          clearInterval(interval);
          return prev;
        }
      });
    }, 1200);

    setProgress(pipelineSteps[0].progress);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`p-6 bg-slate-950 text-emerald-400 rounded-3xl font-mono border-2 border-emerald-950 shadow-2xl relative overflow-hidden ${isHC ? 'thick-border' : ''}`}>
      {/* Background Matrix Binary Grid effect */}
      <div className="absolute inset-0 opacity-[0.03] text-[9px] pointer-events-none select-none overflow-hidden leading-none p-2">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="whitespace-nowrap overflow-hidden">
            {Array.from({ length: 120 }).map(() => (Math.random() > 0.5 ? '1' : '0')).join(' ')}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-6 border-b border-slate-900 pb-4 justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span className="text-sm font-bold tracking-wider">COGNITIVE DIAGNOSTIC SCANNER v8.0</span>
        </div>
        <div className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded">TPU_NODE_ONLINE</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Animated Scanner Box */}
        <div className="relative aspect-square max-w-[320px] mx-auto w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
          {/* Diagnostic Scanning Line */}
          <div className="absolute w-full h-1.5 bg-emerald-400 opacity-80 shadow-[0_0_15px_#10b981] scan-line z-20"></div>

          {/* Simulation overlays */}
          {/* Target circle */}
          <div className="w-48 h-48 border-2 border-dashed border-emerald-900 rounded-full flex items-center justify-center animate-spin-slow"></div>
          
          {/* YOLO bounding box overlay */}
          {progress >= 58 && (
            <div className="absolute top-16 left-16 right-16 bottom-16 border-2 border-red-500 bg-red-500/10 flex flex-col justify-between p-1.5 z-10 animate-fade-in">
              <span className="text-[9px] bg-red-500 text-white px-1 py-0.5 font-bold self-start rounded">WOUND YOLOv8: 98.6%</span>
              <span className="text-[8px] text-red-400 self-end font-semibold">LOC: [x:112, y:204]</span>
            </div>
          )}

          {/* Contours segmentation overlays */}
          {progress >= 72 && (
            <div className="absolute inset-20 border-2 border-blue-400 rounded-full bg-blue-500/5 animate-pulse z-10">
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] bg-blue-500 text-white px-1.5 rounded">OPENCV_CONTOUR</span>
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-sm border border-slate-800 p-2 rounded-lg text-center text-xs">
            <span className="text-slate-400">FPS:</span> 29.8 | <span className="text-slate-400">LATENCY:</span> 14ms
          </div>
        </div>

        {/* Stepper logs */}
        <div className="flex flex-col h-[320px] justify-between">
          <div className="flex-1 overflow-y-auto space-y-2 text-xs border border-slate-900 bg-slate-950/40 p-4 rounded-xl max-h-[220px]">
            {logMessages.map((msg, i) => (
              <div key={i} className="text-emerald-500/70">{msg}</div>
            ))}
            <div className="text-emerald-400 font-bold animate-pulse">
              &gt; {pipelineSteps[currentStepIndex].label}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Overall pipeline status:</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-400 h-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AICognitivePipeline;
