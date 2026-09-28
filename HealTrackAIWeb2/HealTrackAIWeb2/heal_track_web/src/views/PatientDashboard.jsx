import React, { useState, useRef } from 'react';
import InteractiveChart from '../components/InteractiveChart';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import VoiceAssistant from '../components/VoiceAssistant';
import MedicationReminder from '../components/MedicationReminder';
import AICognitivePipeline from '../components/AICognitivePipeline';
import { Camera, Calendar, MessageSquare, AlertCircle, CheckCircle, Clock, FileDown, Heart, ShieldAlert, Sparkles, HelpCircle, X, ImagePlus } from 'lucide-react';

const mockDoctors = [
  { id: 'doctor_1', name: 'Dr. Sarah Jenkins', specialty: 'Orthopedic Surgeon', hospital: 'Metro General Hospital', rating: 4.9, experience: 15 },
  { id: 'doctor_2', name: 'Dr. Marcus Vance', specialty: 'Wound Specialist', hospital: 'St. Jude Medical Center', rating: 4.8, experience: 12 },
  { id: 'doctor_3', name: 'Dr. Elena Rostova', specialty: 'Dermatologist', hospital: 'City Skin Clinic', rating: 4.7, experience: 8 }
];

const healthTips = [
  "Protein is essential for post-surgery tissue repair. Include eggs, lean meats, and beans in your meals.",
  "Avoid direct sunlight on your surgical scar for the first 6 months to prevent hyperpigmentation.",
  "Hydration keeps your skin elastic and supports cellular regeneration. Aim for 8-10 glasses of water.",
  "Keep the wound site elevated above your heart level when resting to decrease post-op swelling.",
  "Wash your hands thoroughly with soap and water for 20 seconds before touching any wound dressing."
];

function PatientDashboard({ 
  patient, 
  medications, 
  appointments, 
  woundImages, 
  notifications, 
  onToggleMed, 
  onAddMed, 
  onAddApt, 
  onAddWound,
  isHC 
}) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, timeline, voice, book
  
  // Wound Image Upload Flow state
  const [uploadState, setUploadState] = useState('idle'); // idle, guidelines, scanning, result
  const [lightCheck, setLightCheck] = useState(false);
  const [focusCheck, setFocusCheck] = useState(false);
  const [distanceCheck, setDistanceCheck] = useState(false);
  const [visibleCheck, setVisibleCheck] = useState(false);
  const [imageSelected, setImageSelected] = useState(false);
  
  const [tempReport, setTempReport] = useState(null);

  // Real Camera Image upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Live camera capture states
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Appointment states
  const [selectedDoc, setSelectedDoc] = useState(mockDoctors[0]);
  const [aptDate, setAptDate] = useState('');
  const [aptTime, setAptTime] = useState('10:00 AM');

  // File selection capture handler
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
      setImageSelected(true);
    }
  };

  // Stop any active camera stream and release the device
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  // Open the device camera using getUserMedia and stream it into the <video> preview
  const openCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Live camera access is not supported in this browser. Please use "Choose from Files" instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      streamRef.current = stream;
      setCameraOpen(true);
      // Wait a tick so the <video> element is mounted before attaching the stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 0);
    } catch (err) {
      console.log('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access, or use "Choose from Files".');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera was found on this device. Please use "Choose from Files".');
      } else {
        setCameraError('Could not access the camera. Please use "Choose from Files" instead.');
      }
      setCameraOpen(false);
    }
  };

  // Grab the current video frame, convert it to a File, and use it as the selected wound image
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `wound-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setSelectedImage(file);
      setImagePreview(canvas.toDataURL('image/jpeg', 0.92));
      setImageSelected(true);
      stopCameraStream();
    }, 'image/jpeg', 0.92);
  };

  // Ensure the camera is always released (component unmount, tab switch, dialog close, etc.)
  React.useEffect(() => {
    return () => stopCameraStream();
  }, []);

  React.useEffect(() => {
    if (uploadState !== 'guidelines' && cameraOpen) {
      stopCameraStream();
    }
  }, [uploadState]);

  const handleRealScan = async () => {
    setUploadState('scanning');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const report = await response.json();
        // The API returns riskLevel in "RiskLevel.good" format. Let's parse it if needed
        const parsedReport = {
          ...report,
          riskLevel: report.riskLevel.replace('RiskLevel.', ''),
          healingTrend: report.healingTrend.replace('HealingTrend.', '')
        };
        handleScanComplete(parsedReport);
      } else {
        // Fallback to local simulation
        setTimeout(() => {
          const mockReport = {
            healingPercentage: 82.0,
            riskLevel: 'good',
            infectionProbability: 0.04,
            estimatedRecoveryDays: 7,
            healingTrend: 'improving',
            recommendations: [
              "Continue cleaning twice daily with sterile saline.",
              "Apply silicone scar cream on closed sutures.",
              "Perform gentle range-of-motion leg lifts."
            ],
            woundStage: "Remodeling Epithelialization Stage"
          };
          handleScanComplete(mockReport);
        }, 2000);
      }
    } catch (err) {
      console.log("Backend offline, running simulated visual scanning...");
      setTimeout(() => {
        const mockReport = {
          healingPercentage: 82.0,
          riskLevel: 'good',
          infectionProbability: 0.04,
          estimatedRecoveryDays: 7,
          healingTrend: 'improving',
          recommendations: [
            "Continue cleaning twice daily with sterile saline.",
            "Apply silicone scar cream on closed sutures.",
            "Perform gentle range-of-motion leg lifts."
          ],
          woundStage: "Remodeling Epithelialization Stage"
        };
        handleScanComplete(mockReport);
      }, 2000);
    }
  };
  const [aptType, setAptType] = useState('offline');

  // Stats
  const latestUpload = woundImages.length > 0 ? woundImages[woundImages.length - 1] : null;
  const latestReport = latestUpload?.aiReport;
  const healingPercentage = latestReport?.healingPercentage || 0;
  const riskLevel = latestReport?.riskLevel || 'moderate';
  const recoveryDays = latestReport?.estimatedRecoveryDays || 30;

  const tipOfTheDay = healthTips[new Date().getDate() % healthTips.length];

  const handleStartScan = () => {
    handleRealScan();
  };

  const handleScanComplete = (report) => {
    setTempReport(report);
    setUploadState('result');
  };

  const handleSaveResult = () => {
    if (tempReport) {
      onAddWound(tempReport);
      setTempReport(null);
      setUploadState('idle');
      // Reset checkers
      setLightCheck(false);
      setFocusCheck(false);
      setDistanceCheck(false);
      setVisibleCheck(false);
      setImageSelected(false);
      setSelectedImage(null);
      setImagePreview(null);
      setCameraError(null);
      stopCameraStream();
      setActiveTab('timeline'); // Go check progress
    }
  };

  // Central place to translate an AI riskLevel into label/emoji/Tailwind classes,
  // so every panel that displays risk (overview card + diagnostic report) stays in sync.
  const getRiskMeta = (level) => {
    switch (level) {
      case 'high':
        return {
          label: 'High Risk',
          emoji: '🔴',
          text: 'text-red-600 dark:text-red-400',
          border: 'border-red-500',
          headerText: 'text-red-800 dark:text-red-400',
          button: 'bg-red-600 hover:bg-red-700 shadow-red-500/10'
        };
      case 'moderate':
        return {
          label: 'Moderate Risk',
          emoji: '🟡',
          text: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-500',
          headerText: 'text-amber-800 dark:text-amber-400',
          button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10'
        };
      case 'good':
      default:
        return {
          label: 'Good Healing',
          emoji: '🟢',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-500',
          headerText: 'text-emerald-800 dark:text-emerald-400',
          button: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10'
        };
    }
  };

  const handleAptSubmit = (e) => {
    e.preventDefault();
    if (aptDate && selectedDoc) {
      onAddApt(selectedDoc, new Date(aptDate + ' ' + aptTime), aptType);
      alert(`Appointment requested with ${selectedDoc.name}!`);
      setAptDate('');
      setActiveTab('overview');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT & CENTER PANELS: Navigation and Core Panels */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Patient header card */}
        <div className={`p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-3xl relative overflow-hidden shadow-xl ${isHC ? 'thick-border bg-none bg-blue-900' : ''}`}>
          <div className="absolute right-0 bottom-0 opacity-10 translate-y-6 translate-x-6">
            <Heart className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">Patient Portal</span>
              <h2 className="title-font text-3xl font-extrabold mt-2">{patient.name}</h2>
              <p className="text-xs text-blue-100 font-semibold mt-1">
                Age: {patient.age} • Blood Group: {patient.bloodGroup} • Surgery Date: {new Date(patient.surgeryDate).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10 text-center">
              <span className="block text-[10px] text-blue-200 font-bold uppercase tracking-wider">Post-Op Recovery</span>
              <span className="text-xl font-black">Day 14</span>
            </div>
          </div>
        </div>

        {/* Dynamic Warning Alert Banner if HIGH RISK is detected */}
        {riskLevel === 'high' && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-500 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-red-900 dark:text-red-300">CRITICAL INFECTION RISK FLAG</h4>
                <p className="text-xs text-red-700 dark:text-red-400 mt-0.5 leading-relaxed">
                  Today's diagnostic scan indicated high bacterial activity coordinates. Our surgeons recommend scheduling an immediate clinical visit.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('book')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shrink-0 active:scale-[0.98] transition-all"
            >
              Request Surgeon Visit
            </button>
          </div>
        )}

        {/* Tabs picker navigation */}
        <div className="flex bg-gray-100 dark:bg-slate-900/60 p-1 rounded-2xl text-xs font-bold gap-1 shadow-inner border border-gray-200/50 dark:border-slate-800/40 w-fit">
          {['overview', 'timeline', 'voice', 'book'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 capitalize transition-all rounded-xl ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-250/5 dark:border-slate-700/50'
                  : 'text-gray-400 hover:text-gray-650 dark:hover:text-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick overview of latest analysis stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Circular Recovery progress info card */}
              <div className={`p-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 flex items-center justify-between shadow-sm ${isHC ? 'thick-border' : ''}`}>
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider">Wound Healing Status</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black title-font">{healingPercentage}%</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      riskLevel === 'good' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
                        : riskLevel === 'moderate'
                          ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400'
                          : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400'
                    }`}>
                      {riskLevel === 'good' ? '🟢 Good Healing' : riskLevel === 'moderate' ? '🟡 Moderate Risk' : '🔴 High Risk'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                    Estimated complete recovery: <strong className="text-gray-700 dark:text-gray-200">{recoveryDays} days</strong>.
                  </p>
                </div>
                <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
                  {/* Custom progress circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="36" cy="36" r="30" className="stroke-gray-100 dark:stroke-slate-800" strokeWidth="6" fill="transparent" />
                    <circle cx="36" cy="36" r="30" 
                      className={riskLevel === 'good' ? 'stroke-emerald-500' : riskLevel === 'moderate' ? 'stroke-amber-500' : 'stroke-red-500'} 
                      strokeWidth="6" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 30}
                      strokeDashoffset={2 * Math.PI * 30 * (1 - healingPercentage / 100)}
                    />
                  </svg>
                  <span className="absolute text-xs font-black">{healingPercentage}%</span>
                </div>
              </div>

              {/* Upload image button trigger */}
              <div 
                onClick={() => setUploadState('guidelines')}
                className={`p-5 bg-blue-50/50 hover:bg-blue-100/50 dark:bg-blue-950/10 dark:hover:bg-blue-950/20 border-2 border-dashed border-blue-200 dark:border-blue-900/30 rounded-3xl flex flex-col justify-between h-[116px] cursor-pointer shadow-sm active:scale-[0.99] transition-all`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-blue-950 dark:text-blue-200">Upload Wound Photo</h4>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">Continuous automated AI tracking</p>
                </div>
              </div>
            </div>

            {/* Care guidelines dialog overlays */}
            {uploadState === 'guidelines' && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-blue-500 shadow-xl space-y-4">
                <h3 className="title-font font-bold text-lg text-gray-800 dark:text-gray-150">Pre-Upload Accuracy Checklist</h3>
                <p className="text-xs text-gray-400">Verify these simple lighting rules before capturing your surgical sutures.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-900 border rounded-xl cursor-pointer">
                    <input type="checkbox" checked={lightCheck} onChange={e => setLightCheck(e.target.checked)} className="accent-blue-600" />
                    <div>
                      <strong className="block">Good Natural Lighting</strong>
                      <span className="text-[10px] text-gray-400">Avoid heavy shadows or glare</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-900 border rounded-xl cursor-pointer">
                    <input type="checkbox" checked={focusCheck} onChange={e => setFocusCheck(e.target.checked)} className="accent-blue-600" />
                    <div>
                      <strong className="block">Clear Locked Focus</strong>
                      <span className="text-[10px] text-gray-400">Sutures must be blur-free</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-900 border rounded-xl cursor-pointer">
                    <input type="checkbox" checked={distanceCheck} onChange={e => setDistanceCheck(e.target.checked)} className="accent-blue-600" />
                    <div>
                      <strong className="block">Same Camera Distance (10cm)</strong>
                      <span className="text-[10px] text-gray-400">Hold at equal height every log</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-900 border rounded-xl cursor-pointer">
                    <input type="checkbox" checked={visibleCheck} onChange={e => setVisibleCheck(e.target.checked)} className="accent-blue-600" />
                    <div>
                      <strong className="block">Entire Sutures Visible</strong>
                      <span className="text-[10px] text-gray-400">Do not crop edges of wound out</span>
                    </div>
                  </label>
                </div>

                <div className="p-3 bg-blue-50/50 dark:bg-slate-900 border border-blue-100 rounded-2xl">
                  {cameraOpen ? (
                    <div className="mb-3 relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-44 object-cover rounded-xl border border-gray-200 dark:border-slate-800 bg-black"
                      />
                      <span className="absolute top-2 left-2 text-[9px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                      </span>
                      <button
                        type="button"
                        onClick={stopCameraStream}
                        className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : imagePreview ? (
                    <div className="mb-3">
                      <img src={imagePreview} alt="Preview" className="w-full h-44 object-cover rounded-xl border border-gray-200 dark:border-slate-800" />
                      <span className="block text-[10px] text-gray-400 mt-1 text-center font-bold">Image Preview Loaded Successfully</span>
                    </div>
                  ) : (
                    <div className="h-36 bg-gray-100 dark:bg-slate-950 rounded-xl flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-300 dark:border-slate-800 mb-3">
                      <Camera className="w-8 h-8 mb-1.5 opacity-60 animate-pulse" />
                      <span className="text-[10px] font-semibold">Camera/File preview will appear here</span>
                    </div>
                  )}

                  {cameraError && (
                    <p className="text-[10px] text-red-600 dark:text-red-400 font-semibold mb-2 text-center">{cameraError}</p>
                  )}

                  {/* Hidden canvas used to grab a still frame from the live video stream */}
                  <canvas ref={canvasRef} className="hidden" />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment" // Auto triggers camera on mobile devices without live-preview support
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {cameraOpen ? (
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 active:scale-[0.99] transition-all"
                    >
                      <Camera className="w-4 h-4" /> Capture Photo
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={openCamera}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 active:scale-[0.99] transition-all"
                      >
                        <Camera className="w-4 h-4" /> {imagePreview ? 'Retake Photo' : 'Open Camera'}
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="flex-1 py-3 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all"
                      >
                        <ImagePlus className="w-4 h-4" /> Choose from Files
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    onClick={() => { stopCameraStream(); setCameraError(null); setUploadState('idle'); }}
                    className="py-2 px-4 border rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleStartScan}
                    disabled={!(lightCheck && focusCheck && distanceCheck && visibleCheck && imageSelected)}
                    className="py-2 px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-xl text-xs font-bold disabled:cursor-not-allowed shadow-md"
                  >
                    Start AI Diagnostic Pipeline
                  </button>
                </div>
              </div>
            )}

            {uploadState === 'scanning' && (
              <AICognitivePipeline onComplete={handleScanComplete} isHC={isHC} />
            )}

            {uploadState === 'result' && tempReport && (() => {
              const risk = getRiskMeta(tempReport.riskLevel);
              return (
              <div className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 ${risk.border} shadow-xl space-y-4`}>
                <div className="flex justify-between items-center pb-2 border-b">
                  <h3 className={`title-font font-bold text-lg ${risk.headerText} flex items-center gap-2`}>
                    {tempReport.riskLevel === 'high' ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    AI Analysis Report Complete
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">REPORT_ID: {Date.now()}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-2xl border">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Healing rate</span>
                    <strong className={`text-2xl ${risk.text}`}>{tempReport.healingPercentage}%</strong>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-2xl border">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Risk classification</span>
                    <strong className={`text-sm block mt-1.5 ${risk.text} capitalize`}>
                      {risk.emoji} {risk.label}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-2xl border">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Infection probability</span>
                    <strong className={`text-sm block mt-1.5 ${risk.text}`}>
                      {tempReport.infectionProbability != null ? `${Math.round(tempReport.infectionProbability * 100)}%` : '—'}
                    </strong>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-2xl border">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase">Est. recovery</span>
                    <strong className="text-sm block mt-1.5 text-gray-700 dark:text-gray-300">
                      {tempReport.estimatedRecoveryDays != null ? `${tempReport.estimatedRecoveryDays} days` : '—'}
                    </strong>
                  </div>
                </div>

                {tempReport.riskLevel === 'high' && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-red-700 dark:text-red-400 leading-relaxed">
                      This scan shows signs consistent with elevated infection/complication risk. We recommend booking a surgeon visit as soon as possible.
                    </p>
                  </div>
                )}

                {/* Side-by-Side Image Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  {/* Left: Patient Upload */}
                  <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-2xl border flex flex-col justify-between">
                    <div>
                      <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Your Uploaded Suture Photo</span>
                      <img 
                        src={imagePreview || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300"} 
                        alt="Patient Wound" 
                        className="w-full h-40 object-cover rounded-xl border bg-gray-200" 
                      />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-2 font-mono">
                      Staged: {tempReport.woundStage}
                    </div>
                  </div>

                  {/* Right: Matched Reference Case */}
                  {(() => {
                    const match = tempReport.datasetMatch || {
                      url: 'http://localhost:8000/dataset_images/ref_healing.jpg',
                      similarity: 82.4,
                      status: 'healing',
                      notes: 'Granulating proliferative stage, stable recovery, normal redness.'
                    };
                    
                    return (
                      <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-2xl border flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Closest Dataset Match</span>
                            <span className={`px-2 py-0.5 rounded-full font-black text-[9px] border ${
                              match.status === 'healed'
                                ? 'bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20'
                                : match.status === 'healing'
                                  ? 'bg-blue-50 border-blue-250 text-blue-700 dark:bg-blue-950/20'
                                  : 'bg-red-50 border-red-250 text-red-700 dark:bg-red-950/20'
                            }`}>
                              {match.similarity}% SIMILARITY
                            </span>
                          </div>
                          
                          <img 
                            src={match.url} 
                            alt="Reference Match" 
                            onError={(e) => {
                              // fallback
                              e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300';
                            }}
                            className="w-full h-40 object-cover rounded-xl border bg-gray-200 animate-fade-in" 
                          />
                        </div>
                        
                        <div className="mt-2 text-[10px] space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400 font-bold">Status:</span>
                            <span className="capitalize font-extrabold text-blue-650 dark:text-blue-400">{match.status}</span>
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 leading-normal italic">
                            "{match.notes}"
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="text-xs space-y-2">
                  <span className="font-bold text-gray-700 dark:text-gray-300">Recommendations Summary:</span>
                  <ul className="list-disc pl-5 text-gray-500 dark:text-gray-400 space-y-1">
                    {tempReport.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ul>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={handleSaveResult}
                    className={`py-2.5 px-6 ${risk.button} text-white rounded-2xl text-xs font-bold shadow-md`}
                  >
                    Approve and Sync Dashboard
                  </button>
                </div>
              </div>
              );
            })()}

            {/* Health Tip banner card */}
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/10 rounded-3xl flex gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-sm text-emerald-950 dark:text-emerald-300">Clinical Tip of the Day</h5>
                <p className="text-xs text-emerald-800 dark:text-emerald-400 leading-normal">{tipOfTheDay}</p>
              </div>
            </div>

            {/* Active Schedule Quick-List */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="title-font font-bold text-lg">Upcoming Appointments</h3>
              {appointments.length === 0 ? (
                <p className="text-xs text-gray-400">No appointments scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {appointments.map(apt => (
                    <div key={apt.id} className="flex justify-between items-center p-3.5 bg-gray-50 dark:bg-slate-900 rounded-2xl border text-xs">
                      <div>
                        <strong className="block text-sm">{apt.doctorName}</strong>
                        <span className="text-gray-400 block mt-0.5">{apt.specialty}</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(apt.dateTime).toLocaleDateString()} at {new Date(apt.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-full font-bold uppercase text-[9px] border ${
                          apt.status === 'accepted'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30'
                            : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20'
                        }`}>
                          {apt.status}
                        </span>
                        <span className="block text-[9px] text-gray-400 capitalize mt-1.5">{apt.type} Vis</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <InteractiveChart isHC={isHC} />
            <BeforeAfterSlider isHC={isHC} />

            {/* List of past image logs */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="title-font font-bold text-lg">Historical Sutures Log History</h3>
              <div className="space-y-3">
                {woundImages.slice().reverse().map(img => (
                  <div key={img.id} className="p-3 bg-gray-50 dark:bg-slate-900 border rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-slate-800 border rounded-xl flex items-center justify-center">
                        <Camera className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                      </div>
                      <div>
                        <strong className="block text-sm">AI analysis: {img.aiReport.healingPercentage}% Healed</strong>
                        <span className="text-gray-400 block mt-0.5">Uploaded {img.date}</span>
                        <span className="text-[10px] text-gray-400 italic mt-0.5 block">{img.aiReport.woundStage}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] border ${
                        img.aiReport.riskLevel === 'good'
                          ? 'bg-emerald-50 border-emerald-250 text-emerald-800'
                          : img.aiReport.riskLevel === 'moderate'
                            ? 'bg-amber-50 border-amber-250 text-amber-800'
                            : 'bg-red-50 border-red-250 text-red-800'
                      }`}>
                        {img.aiReport.riskLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Voice */}
        {activeTab === 'voice' && (
          <VoiceAssistant isHC={isHC} />
        )}

        {/* Tab: Book */}
        {activeTab === 'book' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="title-font font-bold text-xl">Schedule Specialist Visit</h3>
              <p className="text-xs text-gray-400 mt-1">Select available surgeon slots matching your surgery location</p>
            </div>

            <form onSubmit={handleAptSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-gray-500 mb-1.5">Choose Doctor Specialist:</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {mockDoctors.map(doc => {
                    const isSelected = selectedDoc?.id === doc.id;
                    return (
                      <div 
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        className={`p-3.5 border rounded-2xl cursor-pointer text-center space-y-1.5 transition-all ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-500' 
                            : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        <strong className="block text-gray-800 dark:text-gray-250">{doc.name}</strong>
                        <span className="block text-[10px] text-gray-400">{doc.specialty}</span>
                        <span className="inline-block text-[9px] bg-blue-100/50 dark:bg-slate-800 px-2 py-0.5 rounded text-blue-700 dark:text-blue-400">⭐ {doc.rating}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 mb-1.5">Preferred Date:</label>
                  <input 
                    type="date" 
                    value={aptDate}
                    onChange={e => setAptDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border rounded-xl focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1.5">Preferred Mode:</label>
                  <div className="flex bg-gray-150 dark:bg-slate-900 p-1 rounded-xl">
                    <button 
                      type="button" 
                      onClick={() => setAptType('offline')}
                      className={`flex-1 py-2 text-center rounded-lg ${aptType === 'offline' ? 'bg-white dark:bg-slate-800 font-bold' : 'text-gray-400'}`}
                    >
                      In-Clinic
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setAptType('online')}
                      className={`flex-1 py-2 text-center rounded-lg ${aptType === 'online' ? 'bg-white dark:bg-slate-800 font-bold' : 'text-gray-400'}`}
                    >
                      Telehealth
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all text-sm"
              >
                Request Appointment Confirmations
              </button>
            </form>
          </div>
        )}
      </div>

      {/* RIGHT SIDE PANEL: Medications, Notifications, Contacts */}
      <div className="space-y-6">
        
        {/* Medication checklist card */}
        <MedicationReminder 
          medications={medications}
          onToggleMed={onToggleMed}
          onAddMed={onAddMed}
          isHC={isHC}
        />

        {/* Notifications logs */}
        <div className={`p-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm ${isHC ? 'thick-border' : ''}`}>
          <div className="flex justify-between items-center pb-3 border-b mb-4">
            <h4 className="font-bold text-sm">System Updates Badge</h4>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400 px-2 py-0.5 rounded">
              {notifications.filter(n => !n.read).length} Unread
            </span>
          </div>
          <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
            {notifications.map(n => (
              <div key={n.id} className="flex gap-2.5 items-start text-xs border-b last:border-b-0 pb-3 last:pb-0">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-gray-300' : 'bg-blue-600'}`}></span>
                <div>
                  <strong className="block font-bold text-gray-850 dark:text-gray-200">{n.title}</strong>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal mt-0.5">{n.body}</p>
                  <span className="text-[9px] text-gray-400 block mt-1">{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency contact widget */}
        <div className="p-5 bg-red-50/50 dark:bg-red-950/10 border border-red-200/50 dark:border-red-900/10 rounded-3xl space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h4 className="font-bold text-sm text-red-950 dark:text-red-300">Emergency contact</h4>
          </div>
          <div className="text-xs space-y-1.5 text-red-900 dark:text-red-400">
            <div className="flex justify-between">
              <span>Contact Person:</span>
              <strong className="font-bold">{patient.emergencyContactName}</strong>
            </div>
            <div className="flex justify-between">
              <span>Phone Number:</span>
              <strong className="font-bold">{patient.emergencyContactPhone}</strong>
            </div>
          </div>
          <button 
            onClick={() => alert(`Calling emergency contact: ${patient.emergencyContactPhone}...`)}
            className="w-full py-2.5 bg-red-500 hover:bg-red-650 text-white rounded-2xl font-bold text-xs shadow-md shadow-red-500/10 transition-all"
          >
            Call Contact Immediately
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
