import React, { useState } from 'react';
import { Pill, Check, Clock, Plus, Trash2 } from 'lucide-react';

function MedicationReminder({ medications, onToggleMed, onAddMed, isHC }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [selectedTimes, setSelectedTimes] = useState([]);

  // Calculate overall compliance ratio
  let totalDoses = 0;
  let completedDoses = 0;

  medications.forEach(med => {
    med.times.forEach(t => {
      totalDoses++;
      if (med.status[t]) completedDoses++;
    });
  });

  const progressPercent = totalDoses === 0 ? 0 : Math.round((completedDoses / totalDoses) * 100);

  const timesOptions = ['08:00 AM', '02:00 PM', '08:00 PM'];

  const handleTimeToggle = (t) => {
    if (selectedTimes.includes(t)) {
      setSelectedTimes(prev => prev.filter(time => time !== t));
    } else {
      setSelectedTimes(prev => [...prev, t]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (medName.trim() && dosage.trim() && selectedTimes.length > 0) {
      onAddMed(medName.trim(), dosage.trim(), selectedTimes);
      setMedName('');
      setDosage('');
      setSelectedTimes([]);
      setShowAddForm(false);
    }
  };

  return (
    <div className={`p-5 bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 ${isHC ? 'thick-border' : ''}`}>
      <div className="flex justify-between items-center pb-3 border-b mb-4">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-pink-500" />
          <h4 className="font-bold text-sm">Medication Checklist</h4>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-1.5 bg-pink-50 text-pink-600 hover:bg-pink-100 dark:bg-pink-950/20 dark:text-pink-400 rounded-lg flex items-center gap-1 text-xs font-bold transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Schedule
        </button>
      </div>

      {/* Progress compliance bar */}
      <div className="mb-6 bg-pink-50/50 dark:bg-pink-950/10 p-3 rounded-2xl border border-pink-100/50 dark:border-pink-900/10">
        <div className="flex justify-between text-xs font-bold text-pink-850 dark:text-pink-300 mb-1.5">
          <span>Adherence Goal Progress</span>
          <span>{completedDoses}/{totalDoses} Taken ({progressPercent}%)</span>
        </div>
        <div className="w-full bg-pink-100/50 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-pink-500 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {showAddForm ? (
        <form onSubmit={handleSave} className="bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 mb-4 text-xs space-y-3">
          <h5 className="font-bold text-gray-700 dark:text-gray-300">New Medication Schedule</h5>
          <div>
            <label className="block text-gray-400 mb-1">Medicine Name:</label>
            <input 
              type="text" 
              placeholder="e.g. Amoxicillin" 
              value={medName}
              onChange={e => setMedName(e.target.value)}
              className="w-full p-2 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Dosage Details:</label>
            <input 
              type="text" 
              placeholder="e.g. 500mg, 1 Capsule" 
              value={dosage}
              onChange={e => setDosage(e.target.value)}
              className="w-full p-2 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1.5">Select Dosing Intervals:</label>
            <div className="flex gap-2">
              {timesOptions.map(t => {
                const isSelected = selectedTimes.includes(t);
                return (
                  <button 
                    key={t}
                    type="button"
                    onClick={() => handleTimeToggle(t)}
                    className={`flex-1 py-1.5 border rounded-lg font-bold transition-all ${
                      isSelected 
                        ? 'bg-pink-500 border-pink-500 text-white' 
                        : 'bg-white border-gray-200 text-gray-600 dark:bg-slate-950 dark:border-slate-800 dark:text-gray-300'
                    }`}
                  >
                    {t.split(' ')[0]} {/* Show just the hour */}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2 pt-1.5">
            <button 
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-2 border rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-bold"
            >
              Save Schedule
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
          {medications.map(med => (
            <div key={med.id} className="border-b border-gray-100 dark:border-slate-800 pb-3 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-bold text-sm text-gray-800 dark:text-gray-200">{med.name}</h5>
                  <span className="text-xs text-gray-400">{med.dosage} • {med.frequency}</span>
                </div>
              </div>

              {/* Intervals checklist */}
              <div className="space-y-1.5">
                {med.times.map(t => {
                  const isTaken = med.status[t] || false;
                  return (
                    <div 
                      key={t}
                      onClick={() => onToggleMed(med.id, t)}
                      className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer select-none transition-all ${
                        isTaken 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-300' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-slate-900 dark:border-slate-800 dark:text-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-semibold">{t}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                        isTaken 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                      }`}>
                        {isTaken && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MedicationReminder;
