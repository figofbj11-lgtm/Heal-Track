import React, { useState, useEffect } from 'react';
import Login from './views/Login';
import Register from './views/Register';
import PatientDashboard from './views/PatientDashboard';
import DoctorDashboard from './views/DoctorDashboard';
import AdminDashboard from './views/AdminDashboard';
import { Shield, Eye, EyeOff, Activity, User, LogOut, Moon, Sun, Volume2 } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('splash'); // splash, login, register, patient, doctor, admin
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('patient'); // patient, doctor, admin
  
  // Accessibility & UI Modes
  const [accessibilityActive, setAccessibilityActive] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Global Mock Database State
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'AI Analysis Complete', body: 'Wound Day 14 healing is 82% (Good).', time: '4 hours ago', read: false, type: 'info' },
    { id: '2', title: 'Medication Alert', body: 'Time for Ibuprofen 400mg (09:00 PM).', time: '2 hours ago', read: false, type: 'medication' },
    { id: '3', title: 'Appointment Confirmed', body: 'Appointment scheduled with Dr. Sarah Jenkins next Monday.', time: '1 day ago', read: true, type: 'appointment' },
  ]);

  const [medications, setMedications] = useState([
    { id: 'med_1', name: 'Amoxicillin 500mg', dosage: '1 capsule', times: ['08:00 AM', '02:00 PM', '08:00 PM'], status: {'08:00 AM': true, '02:00 PM': true, '08:00 PM': false}, frequency: 'Daily (Antibiotic)' },
    { id: 'med_2', name: 'Ibuprofen 400mg', dosage: '1 tablet', times: ['09:00 AM', '09:00 PM'], status: {'09:00 AM': true, '09:00 PM': false}, frequency: 'Daily (Pain Relief)' },
    { id: 'med_3', name: 'Lisinopril 10mg', dosage: '1 tablet', times: ['08:00 AM'], status: {'08:00 AM': true}, frequency: 'Daily (Blood Pressure)' }
  ]);

  const [appointments, setAppointments] = useState([
    { id: 'apt_1', doctorName: 'Dr. Sarah Jenkins', specialty: 'Orthopedic Surgeon', dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), status: 'accepted', type: 'offline' },
    { id: 'apt_2', doctorName: 'Dr. Marcus Vance', specialty: 'Wound Specialist', dateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'accepted', type: 'online' }
  ]);

  const [woundImages, setWoundImages] = useState([
    {
      id: 'img_1',
      date: '14 days ago',
      imagePath: 'baseline',
      aiReport: {
        healingPercentage: 15.0,
        riskLevel: 'high',
        infectionProbability: 0.72,
        estimatedRecoveryDays: 28,
        healingTrend: 'stable',
        recommendations: ["Keep dressing completely dry.", "Avoid physical exertion.", "Take prescribed antibiotics."],
        woundStage: "Inflammatory Stage"
      }
    },
    {
      id: 'img_7',
      date: '7 days ago',
      imagePath: 'granulating',
      aiReport: {
        healingPercentage: 45.0,
        riskLevel: 'moderate',
        infectionProbability: 0.28,
        estimatedRecoveryDays: 18,
        healingTrend: 'improving',
        recommendations: ["Clean wound twice daily with saline.", "Apply antibiotic ointment.", "Report any foul odor."],
        woundStage: "Proliferative Stage"
      }
    },
    {
      id: 'img_14',
      date: '4 hours ago',
      imagePath: 'remodeling',
      aiReport: {
        healingPercentage: 82.0,
        riskLevel: 'good',
        infectionProbability: 0.05,
        estimatedRecoveryDays: 7,
        healingTrend: 'improving',
        recommendations: ["Keep area moisturized with silicone gel.", "Gentle stretching allowed.", "Excellent healing progress."],
        woundStage: "Remodeling Stage"
      }
    }
  ]);

  // Handle CSS Class injects for Dark Mode & Accessibility
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    if (accessibilityActive) {
      document.body.classList.add('accessibility-active');
    } else {
      document.body.classList.remove('accessibility-active');
    }
  }, [accessibilityActive]);

  // Splash Screen automatic redirect
  useEffect(() => {
    if (currentView === 'splash') {
      const timer = setTimeout(() => {
        setCurrentView('login');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  const handleLogin = (user, role) => {
    setCurrentUser(user);
    setUserRole(role);
    setCurrentView(role); // Navigate to matching role view
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  // State manipulation methods
  const toggleMedication = (medId, time) => {
    setMedications(prev => prev.map(med => {
      if (med.id === medId) {
        return {
          ...med,
          status: {
            ...med.status,
            [time]: !med.status[time]
          }
        };
      }
      return med;
    }));
  };

  const addMedication = (name, dosage, times) => {
    const newMed = {
      id: `med_${Date.now()}`,
      name,
      dosage,
      times,
      status: times.reduce((acc, t) => ({ ...acc, [t]: false }), {}),
      frequency: 'Daily'
    };
    setMedications(prev => [...prev, newMed]);
  };

  const addAppointment = (doctor, date, type) => {
    const newApt = {
      id: `apt_${Date.now()}`,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      dateTime: date,
      status: 'pending',
      type
    };
    setAppointments(prev => [newApt, ...prev]);
  };

  const addWoundImage = (report) => {
    const newUpload = {
      id: `img_${Date.now()}`,
      date: 'Just now',
      imagePath: 'new_upload',
      aiReport: report
    };
    setWoundImages(prev => [...prev, newUpload]);
    // Add notification
    setNotifications(prev => [
      {
        id: `${Date.now()}`,
        title: 'AI Analysis Complete',
        body: `Wound healing classified at ${report.healingPercentage.toInt ? report.healingPercentage.toInt() : Math.round(report.healingPercentage)}% (${report.riskLevel.toUpperCase()}).`,
        time: 'Just now',
        read: false,
        type: 'info'
      },
      ...prev
    ]);
  };

  // Rendering Splash Screen View
  if (currentView === 'splash') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-900 dark:to-slate-950 transition-all duration-500">
        <div className="animate-bounce mb-6 w-24 h-24 bg-blue-600 dark:bg-blue-500 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Activity className="w-12 h-12 text-white" />
        </div>
        <h1 className="title-font text-4xl font-extrabold text-blue-600 dark:text-blue-500 mb-2">HealTrack AI</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Intelligent Post-Surgery Recovery</p>
        <div className="mt-12 w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-all">
      {/* Global Header Bar */}
      <header className="sticky top-0 z-50 glass border-b border-gray-200 dark:border-slate-800 py-4 px-6 flex justify-between items-center card-shadow">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => currentUser ? setCurrentView(userRole) : setCurrentView('login')}>
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="title-font font-bold text-xl tracking-tight text-blue-600 dark:text-blue-500">HealTrack AI</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme & Accessibility controllers */}
          <button 
            onClick={() => setAccessibilityActive(!accessibilityActive)}
            className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
              accessibilityActive 
                ? 'bg-yellow-100 border-yellow-400 text-yellow-800' 
                : 'bg-white hover:bg-gray-100 border-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-gray-200'
            }`}
            title="Elderly Accessibility (Contrast/Sizing Toggle)"
          >
            {accessibilityActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {accessibilityActive ? 'Contrast: ON' : 'Contrast'}
          </button>

          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 transition-all"
            title="Toggle Light/Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {currentUser && (
            <div className="flex items-center gap-3 ml-2 border-l pl-4 border-gray-200 dark:border-slate-700">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-sm font-bold">{currentUser.name || 'Admin'}</span>
                <span className="text-xs text-gray-400 capitalize">{userRole}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:border-red-900/30 dark:hover:bg-red-950/40 transition-all"
                title="Logout Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Core Router Panels */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {currentView === 'login' && (
          <Login onLogin={handleLogin} onRegister={() => setCurrentView('register')} />
        )}
        {currentView === 'register' && (
          <Register onBackToLogin={() => setCurrentView('login')} onRegisterSuccess={handleLogin} />
        )}
        {currentView === 'patient' && (
          <PatientDashboard 
            patient={currentUser}
            medications={medications}
            appointments={appointments}
            woundImages={woundImages}
            notifications={notifications}
            onToggleMed={toggleMedication}
            onAddMed={addMedication}
            onAddApt={addAppointment}
            onAddWound={addWoundImage}
            isHC={accessibilityActive}
          />
        )}
        {currentView === 'doctor' && (
          <DoctorDashboard 
            doctor={currentUser}
            isHC={accessibilityActive}
          />
        )}
        {currentView === 'admin' && (
          <AdminDashboard 
            adminUser={currentUser}
            isHC={accessibilityActive}
            notifications={notifications}
            onAddNotification={(msg) => setNotifications(prev => [
              { id: `${Date.now()}`, title: 'System Notice', body: msg, time: 'Just now', read: false, type: 'info' },
              ...prev
            ])}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="py-6 border-t border-gray-200 dark:border-slate-800 text-center text-xs text-gray-400 bg-white dark:bg-slate-900/50 mt-12">
        <p>© 2026 HealTrack AI. Highly Secure Encrypted Image Storage. HIPAA & GDPR Compliant Medical Design.</p>
      </footer>
    </div>
  );
}

export default App;
