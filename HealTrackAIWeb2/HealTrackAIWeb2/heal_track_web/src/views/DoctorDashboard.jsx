import React, { useState } from 'react';
import { User, Bell, CheckCircle, Video, ShieldAlert, Sparkles, Plus, Clock, Search, ChevronRight, FileCheck, ArrowLeft } from 'lucide-react';

const mockPatients = [
  { id: 'patient_123', name: 'John Doe', age: 68, gender: 'M', surgeryType: 'Knee Arthroplasty', risk: 'good', riskLabel: '🟢 Good Healing', healing: 82, lastUpload: '4 hours ago', medicalHistory: 'Hypertension, Mild Type 2 Diabetes.', emergencyContactName: 'Jane Doe', emergencyContactPhone: '+1 (555) 019-2834' },
  { id: 'patient_2', name: 'Margaret Thatcher', age: 74, gender: 'F', surgeryType: 'Hip Replacement', risk: 'high', riskLabel: '🔴 High Risk', healing: 12, lastUpload: '1 hour ago', medicalHistory: 'Osteoporosis, Mild Asthma.', emergencyContactName: 'Denis Thatcher', emergencyContactPhone: '+1 (555) 043-9821' },
  { id: 'patient_3', name: 'Arthur Pendragon', age: 45, gender: 'M', surgeryType: 'Hernia Repair', risk: 'moderate', riskLabel: '🟡 Moderate Risk', healing: 55, lastUpload: 'Yesterday', medicalHistory: 'None declared.', emergencyContactName: 'Guinevere Pendragon', emergencyContactPhone: '+1 (555) 098-4431' }
];

function DoctorDashboard({ doctor, isHC }) {
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Doctor interactions state
  const [prescription, setPrescription] = useState('');
  const [advice, setAdvice] = useState('');
  const [aiVerified, setAiVerified] = useState(false);
  const [videoConsultationActive, setVideoConsultationActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const selectedPatient = mockPatients.find(p => p.id === selectedPatientId);

  const handleApproveAI = () => {
    setAiVerified(true);
    setStatusMessage('AI diagnostic findings approved and synced to electronic health records.');
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const handleIssuePrescription = (e) => {
    e.preventDefault();
    if (prescription.trim()) {
      setStatusMessage(`Prescription issued: ${prescription}`);
      setPrescription('');
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  const handleSendAdvice = (e) => {
    e.preventDefault();
    if (advice.trim()) {
      setStatusMessage(`Clinical Advice Dispatched: "${advice}"`);
      setAdvice('');
      setTimeout(() => setStatusMessage(''), 4000);
    }
  };

  const filteredPatients = mockPatients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.surgeryType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Clinical Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-5 md:col-span-2 bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl shadow-sm ${isHC ? 'thick-border' : ''}`}>
          <span className="text-[10px] bg-teal-100 text-teal-800 dark:bg-teal-950/20 dark:text-teal-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Clinical Faculty Portal</span>
          <h3 className="title-font font-extrabold text-2xl mt-1.5">{doctor.name}</h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">{doctor.specialty} • {doctor.hospital}</p>
        </div>

        {/* Clinical workload counts */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-4 bg-red-50/50 dark:bg-red-950/10 border border-red-200/30 rounded-3xl flex flex-col justify-center">
            <span className="text-2xl font-black text-red-500">1</span>
            <span className="block text-[9px] text-gray-400 font-bold uppercase mt-1">High Risks</span>
          </div>
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/30 rounded-3xl flex flex-col justify-center">
            <span className="text-2xl font-black text-amber-500">2</span>
            <span className="block text-[9px] text-gray-400 font-bold uppercase mt-1">Due Checks</span>
          </div>
          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-200/30 rounded-3xl flex flex-col justify-center">
            <span className="text-2xl font-black text-blue-500">14</span>
            <span className="block text-[9px] text-gray-400 font-bold uppercase mt-1">Monitored</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-450 border border-emerald-250 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main workspace layout */}
      {!selectedPatient ? (
        // Grid View of Monitored Patients Directory (No patient selected)
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
            <div>
              <h4 className="font-bold text-lg">Hospital Monitored Patients Directory</h4>
              <p className="text-xs text-gray-400">Total verified clinical cases under your active surveillance</p>
            </div>
            <div className="relative text-xs w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name or surgery..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-800 shadow-inner">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-150 dark:border-slate-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-5">Patient Name</th>
                  <th className="py-3 px-4">Age / Sex</th>
                  <th className="py-3 px-4">Surgery Type</th>
                  <th className="py-3 px-4">AI Healing Rate</th>
                  <th className="py-3 px-4">Risk Class</th>
                  <th className="py-3 px-4">Last Check-in</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                {filteredPatients.map(p => (
                  <tr key={p.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-950/5 transition-all">
                    <td className="py-4 px-5 font-bold text-sm text-gray-800 dark:text-gray-250">{p.name}</td>
                    <td className="py-4 px-4 font-medium">{p.age} yrs ({p.gender})</td>
                    <td className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400">{p.surgeryType}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-gray-200/5">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full" 
                            style={{ width: `${p.healing}%` }}
                          ></div>
                        </div>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">{p.healing}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] border ${
                        p.risk === 'high' 
                          ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20' 
                          : p.risk === 'moderate' 
                            ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20' 
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20'
                      }`}>
                        {p.riskLabel}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 font-medium">{p.lastUpload}</td>
                    <td className="py-4 px-5 text-right">
                      <button 
                        onClick={() => setSelectedPatientId(p.id)}
                        className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/10 hover:shadow-lg transition-all active:scale-[0.98]"
                      >
                        Open Case File
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Split view showing Patient details & Case logs (Patient selected)
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Side pane: small case selector list */}
          <div className="space-y-4">
            <button 
              onClick={() => setSelectedPatientId(null)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Patient Directory
            </button>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm space-y-3">
              <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider">Monitored Case Logs</h4>
              <div className="space-y-2">
                {mockPatients.map(p => {
                  const isSelected = selectedPatientId === p.id;
                  return (
                    <div 
                      key={p.id}
                      onClick={() => {
                        setSelectedPatientId(p.id);
                        setAiVerified(false);
                      }}
                      className={`p-2.5 border rounded-xl cursor-pointer flex justify-between items-center text-xs transition-all ${
                        isSelected 
                          ? 'border-blue-650 bg-blue-50/50 dark:bg-blue-950/20' 
                          : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      <div>
                        <strong className="block">{p.name}</strong>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{p.surgeryType}</span>
                      </div>
                      <span className={`text-[9px] font-bold ${p.risk === 'high' ? 'text-red-500' : p.risk === 'moderate' ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {p.healing}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Central Workspace pane: Patient files details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header profile summary */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs text-blue-605 font-bold uppercase">Clinical Diagnostic File</span>
                <h3 className="title-font font-bold text-2xl mt-0.5">{selectedPatient.name}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedPatient.surgeryType} • {selectedPatient.age} years old ({selectedPatient.gender}) • {selectedPatient.riskLabel}
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setVideoConsultationActive(true)}
                  className="flex-1 sm:flex-initial py-2.5 px-4.5 bg-teal-600 hover:bg-teal-750 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/10 active:scale-[0.98] transition-all"
                >
                  <Video className="w-4 h-4" />
                  Telehealth Consult
                </button>
              </div>
            </div>

            {/* Video consultations popups */}
            {videoConsultationActive && (
              <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                <div className="bg-slate-900 text-white max-w-md w-full p-6 rounded-3xl text-center space-y-6 border border-slate-800 shadow-2xl">
                  <div className="w-20 h-20 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto animate-pulse">
                    <Video className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">Consultation Room Link</h3>
                    <p className="text-xs text-slate-400">Initiating encrypted video transmission coordinates...</p>
                    <p className="text-sm font-bold text-teal-400 mt-3">Connecting with {selectedPatient.name}...</p>
                  </div>
                  <button 
                    onClick={() => setVideoConsultationActive(false)}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs active:scale-[0.99] transition-all"
                  >
                    Disconnect Call
                  </button>
                </div>
              </div>
            )}

            {/* Verification and incision timeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="font-bold text-sm">AI Diagnosis Audit Suite</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-slate-900 border rounded-2xl">
                    <span className="text-gray-400 block mb-0.5">AI Classification:</span>
                    <strong className="text-sm font-bold text-blue-600 dark:text-blue-400">{selectedPatient.healing}% Healed</strong>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-slate-900 border rounded-2xl">
                    <span className="text-gray-400 block mb-0.5">Infection Prob:</span>
                    <strong className="text-sm font-bold text-red-500">{(selectedPatient.risk === 'high' ? 0.72 : 0.05) * 100}%</strong>
                  </div>
                </div>
                <button 
                  onClick={handleApproveAI}
                  className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all ${
                    aiVerified 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10' 
                      : 'bg-blue-650 hover:bg-blue-705 text-white shadow-blue-500/10'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  {aiVerified ? 'AI Inference Audited' : 'Approve Findings'}
                </button>
              </div>

              {/* Incision checks tracker list */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="font-bold text-sm">Incision Logs</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2 border border-red-200 bg-red-50/30 dark:border-red-950/20 rounded-xl flex justify-between">
                    <span className="font-bold">Day 1</span>
                    <span className="text-red-500 font-bold">15%</span>
                  </div>
                  <div className="p-2 border border-amber-200 bg-amber-50/30 dark:border-amber-950/20 rounded-xl flex justify-between">
                    <span className="font-bold">Day 7</span>
                    <span className="text-amber-500 font-bold">45%</span>
                  </div>
                  <div className="p-2 border border-emerald-200 bg-emerald-50/30 dark:border-emerald-950/20 rounded-xl flex justify-between">
                    <span className="font-bold">Day 14</span>
                    <span className="text-emerald-500 font-bold">82%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interventions forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Prescribe card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="font-bold text-sm">Issue Prescriptions</h4>
                <form onSubmit={handleIssuePrescription} className="space-y-3 text-xs">
                  <input 
                    type="text" 
                    placeholder="e.g. Cefuroxime 500mg twice daily for 7 days"
                    value={prescription}
                    onChange={e => setPrescription(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border rounded-xl focus:outline-none"
                    required
                  />
                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all"
                  >
                    Issue Prescription
                  </button>
                </form>
              </div>

              {/* Direct Care advice card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-sm space-y-3">
                <h4 className="font-bold text-sm">Direct Care Clinical Advice</h4>
                <form onSubmit={handleSendAdvice} className="space-y-3 text-xs">
                  <input 
                    type="text" 
                    placeholder="e.g. Keep incision clean, dressing dry for 24h"
                    value={advice}
                    onChange={e => setAdvice(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border rounded-xl focus:outline-none"
                    required
                  />
                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all"
                  >
                    Submit Advice
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default DoctorDashboard;
