import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Cpu, Sliders, Users, Database, FileText, Send, CheckCircle, Upload, Image, Trash2 } from 'lucide-react';

function AdminDashboard({ adminUser, isHC, notifications, onAddNotification }) {
  const [activeModel, setActiveModel] = useState('YOLOv8.0-Pro');
  const [confidence, setConfidence] = useState(75); // %
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Reference Dataset states
  const [dataset, setDataset] = useState([]);
  const [datasetFile, setDatasetFile] = useState(null);
  const [datasetStatus, setDatasetStatus] = useState('healing');
  const [datasetNotes, setDatasetNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const stats = [
    { label: 'Total Patients', value: '124', icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { label: 'Verified Doctors', value: '18', icon: Users, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20' },
    { label: 'Secure Sutures Scans', value: '894', icon: Database, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' },
    { label: 'AI Model Accuracy', value: '94.6%', icon: Cpu, color: 'text-green-500 bg-green-50 dark:bg-green-950/20' }
  ];

  useEffect(() => {
    fetchDataset();
  }, []);

  const fetchDataset = async () => {
    try {
      const res = await fetch('http://localhost:8000/dataset');
      if (res.ok) {
        const data = await res.json();
        setDataset(data);
      }
    } catch (err) {
      console.error("Failed to fetch dataset:", err);
      // Fallback defaults
      setDataset([
        { filename: 'ref_healed.jpg', status: 'healed', notes: 'Healthy remodeling tissue, complete skin closure, clean scar line.', url: 'http://localhost:8000/dataset_images/ref_healed.jpg' },
        { filename: 'ref_healing.jpg', status: 'healing', notes: 'Granulating proliferative stage, stable recovery, normal redness.', url: 'http://localhost:8000/dataset_images/ref_healing.jpg' },
        { filename: 'ref_infected.jpg', status: 'infected', notes: 'High infection risk, yellow slough and active localized inflammation.', url: 'http://localhost:8000/dataset_images/ref_infected.jpg' }
      ]);
    }
  };

  const handleModelUpdate = (e) => {
    e.preventDefault();
    setStatusMessage(`AI Config Synced: Running ${activeModel} with confidence threshold ${confidence}%.`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (broadcastMsg.trim()) {
      onAddNotification(broadcastMsg.trim());
      setStatusMessage('Push Broadcast Alert disseminated successfully to patients.');
      setBroadcastMsg('');
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDatasetFile(e.target.files[0]);
    }
  };

  const handleDatasetUpload = async (e) => {
    e.preventDefault();
    if (!datasetFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', datasetFile);
    formData.append('status', datasetStatus);
    formData.append('notes', datasetNotes);

    try {
      const res = await fetch('http://localhost:8000/dataset/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setStatusMessage("Successfully uploaded reference image to dataset.");
        setDatasetFile(null);
        setDatasetNotes('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchDataset();
      } else {
        const error = await res.json();
        setStatusMessage(`Upload failed: ${error.detail || 'Server error'}`);
      }
    } catch (err) {
      setStatusMessage("Failed to upload dataset image. Connection error.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Admin header panel */}
      <div className={`p-5 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl shadow-sm ${isHC ? 'thick-border' : ''}`}>
        <span className="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Root Console</span>
        <h3 className="title-font font-bold text-2xl mt-1.5">{adminUser.name}</h3>
        <p className="text-xs text-gray-400 font-medium">Model orchestrator status • TPU Cluster node status: OPTIMAL</p>

        {statusMessage && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-450 border border-emerald-250 dark:border-emerald-900/30 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="p-5 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl shadow-sm flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-xs text-gray-400 font-bold block">{s.label}</span>
                <strong className="text-2xl font-black title-font">{s.value}</strong>
              </div>
              <div className={`p-3 rounded-2xl ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Config sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Model weights configurations */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm space-y-4">
          <h4 className="font-bold text-sm flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-500" />
            AI Model & Confidence Tuning
          </h4>

          <form onSubmit={handleModelUpdate} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-gray-500 mb-1.5">Active Incision Detector Weights:</label>
              <select 
                value={activeModel}
                onChange={e => setActiveModel(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border rounded-xl focus:outline-none"
              >
                {['YOLOv8.0-Pro', 'YOLOv8.1-Beta', 'EfficientNet-B0-V2', 'ResNet50-V4'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-gray-500">Bounding Box Confidence Threshold:</label>
                <span className="text-blue-650 dark:text-blue-400 font-bold">{confidence}%</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="99" 
                value={confidence} 
                onChange={e => setConfidence(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-gray-150 rounded-lg appearance-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-blue-650 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all"
            >
              Update AI Parameters
            </button>
          </form>
        </div>

        {/* Wound Reference Dataset Console */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm space-y-4 flex flex-col h-[320px] overflow-hidden">
          <div className="flex justify-between items-center shrink-0">
            <h4 className="font-bold text-sm flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-500" />
              Wound Reference Dataset ({dataset.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-y-auto pr-1">
            {/* Upload Form block */}
            <form onSubmit={handleDatasetUpload} className="space-y-2.5 text-[11px] font-semibold border-r border-gray-100 dark:border-slate-800 pr-3">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Add Case Image</div>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center justify-center gap-1 py-1.5 px-3 border border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-slate-900 dark:hover:bg-slate-800 transition-all text-gray-500 w-full"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{datasetFile ? datasetFile.name.substring(0, 15) + '...' : 'Select Wound Image'}</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                  required 
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-0.5">Wound Classification Status:</label>
                <select
                  value={datasetStatus}
                  onChange={e => setDatasetStatus(e.target.value)}
                  className="w-full p-1.5 bg-gray-50 dark:bg-slate-900 border rounded-lg focus:outline-none"
                >
                  <option value="healed">🟢 Healed / Remodeling Scar</option>
                  <option value="healing">🔵 Healing / Granulating Suture</option>
                  <option value="infected">🔴 Infected / High Inflammation</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-0.5">Clinical Match Notes:</label>
                <textarea
                  value={datasetNotes}
                  onChange={e => setDatasetNotes(e.target.value)}
                  placeholder="E.g. Healthy clean sutures closing cleanly..."
                  rows={2}
                  className="w-full p-1.5 bg-gray-50 dark:bg-slate-900 border rounded-lg focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUploading || !datasetFile}
                className="w-full py-1.5 bg-indigo-650 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-lg transition-all text-[11px]"
              >
                {isUploading ? 'Syncing...' : 'Upload Reference Photo'}
              </button>
            </form>

            {/* List/Gallery block */}
            <div className="space-y-2.5 overflow-y-auto max-h-full">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Reference Repository</div>
              {dataset.length === 0 ? (
                <div className="text-gray-400 italic text-center py-8">No dataset images stored.</div>
              ) : (
                <div className="space-y-2">
                  {dataset.map((item, idx) => (
                    <div key={idx} className="flex gap-2.5 p-2 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 text-[10px]">
                      <img 
                        src={item.url} 
                        alt="Dataset Wound" 
                        onError={(e) => {
                          // Handle static load failure gracefully
                          e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&auto=format&fit=crop&q=60';
                        }}
                        className="w-12 h-12 rounded-lg object-cover border shrink-0 bg-gray-200" 
                      />
                      <div className="space-y-0.5 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <span className={`px-1.5 py-0.5 rounded font-black uppercase text-[8px] ${
                            item.status === 'healed'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20'
                              : item.status === 'healing'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20'
                                : 'bg-red-50 text-red-700 dark:bg-red-950/20'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 truncate leading-relaxed" title={item.notes}>
                          {item.notes || 'No notes added'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast tools */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="font-bold text-sm flex items-center gap-1.5">
          <Send className="w-4 h-4 text-indigo-500" />
          Broadcast System Notice alerts
        </h4>

        <form onSubmit={handleBroadcast} className="flex gap-3 text-xs font-semibold">
          <input 
            type="text" 
            placeholder="Type notification broadcast message..."
            value={broadcastMsg}
            onChange={e => setBroadcastMsg(e.target.value)}
            className="flex-1 p-2.5 bg-gray-50 dark:bg-slate-900 border rounded-xl focus:outline-none"
            required
          />
          <button 
            type="submit"
            className="py-2.5 px-6 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all shrink-0"
          >
            Dispatch Push
          </button>
        </form>
      </div>

    </div>
  );
}

export default AdminDashboard;

