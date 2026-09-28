import React, { useState } from 'react';
import { Key, Mail, ShieldAlert, User, ShieldCheck } from 'lucide-react';

const mockPatients = {
  id: 'patient_123',
  name: 'John Doe',
  email: 'patient@healtrack.com',
  age: 68,
  bloodGroup: 'A+',
  emergencyContactName: 'Jane Doe',
  emergencyContactPhone: '+1 (555) 019-2834',
  surgeryType: 'Knee Arthroplasty (Replacement)',
  surgeryDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  medicalHistory: 'Hypertension, Mild Type 2 Diabetes.',
  currentMedications: ['Amoxicillin 500mg', 'Ibuprofen 400mg', 'Lisinopril 10mg'],
};

const mockDoctors = {
  id: 'doctor_456',
  name: 'Dr. Sarah Jenkins',
  email: 'doctor@healtrack.com',
  hospitalId: 'HOSP-7729',
  specialty: 'Orthopedic Surgeon',
  hospital: 'Metro General Hospital',
  experienceYears: 15,
  rating: 4.9,
};

function Login({ onLogin, onRegister }) {
  const [selectedRole, setSelectedRole] = useState('patient'); // patient, doctor, admin
  const [email, setEmail] = useState('patient@healtrack.com');
  const [doctorId, setDoctorId] = useState('');
  const [password, setPassword] = useState('patient123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleToggle = (role) => {
    setSelectedRole(role);
    setErrorMsg('');
    if (role === 'patient') {
      setEmail('patient@healtrack.com');
      setPassword('patient123');
      setDoctorId('');
    } else if (role === 'doctor') {
      setEmail('doctor@healtrack.com');
      setDoctorId('DOC-7729');
      setPassword('doctor123');
    } else {
      setEmail('admin@healtrack.com');
      setPassword('admin123');
      setDoctorId('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setLoading(false);
      if (selectedRole === 'patient') {
        if (email === 'patient@healtrack.com' && password === 'patient123') {
          onLogin(mockPatients, 'patient');
        } else {
          setErrorMsg('Invalid patient email or password.');
        }
      } else if (selectedRole === 'doctor') {
        if (email === 'doctor@healtrack.com' && doctorId === 'DOC-7729' && password === 'doctor123') {
          onLogin(mockDoctors, 'doctor');
        } else {
          setErrorMsg('Invalid hospital email, doctor ID, or password.');
        }
      } else if (selectedRole === 'admin') {
        if (email === 'admin@healtrack.com' && password === 'admin123') {
          onLogin({ name: 'System Administrator' }, 'admin');
        } else {
          setErrorMsg('Invalid system username or security key.');
        }
      }
    }, 800);
  };

  return (
    <div className="max-w-md w-full mx-auto my-12 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-gray-150 dark:border-slate-800 card-shadow">
      <div className="text-center mb-6">
        <h2 className="title-font text-2xl font-extrabold text-gray-800 dark:text-gray-100">Welcome to HealTrack AI</h2>
        <p className="text-xs text-gray-400 mt-1.5 font-medium">Select your portal role to authenticate session</p>
      </div>

      {/* Role Picker Segmented Choice */}
      <div className="flex bg-gray-100 dark:bg-slate-900 p-1.5 rounded-2xl mb-6">
        {['patient', 'doctor', 'admin'].map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => handleRoleToggle(role)}
            className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold capitalize transition-all ${
              selectedRole === role
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field Label & Icon mapping per role */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">
            {selectedRole === 'patient' && 'Email Address'}
            {selectedRole === 'doctor' && 'Hospital Email'}
            {selectedRole === 'admin' && 'System Username'}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-blue-500 transition-all"
              required
            />
          </div>
        </div>

        {/* Doctor-Specific ID Input */}
        {selectedRole === 'doctor' && (
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Doctor ID (e.g. DOC-XXXX):</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="DOC-7729"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-blue-500 transition-all"
                required
              />
            </div>
          </div>
        )}

        {/* Password / Security Key Field */}
        <div>
          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">
            {selectedRole === 'admin' ? 'System Security Key' : 'Password'}
          </label>
          <div className="relative">
            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-blue-500 transition-all"
              required
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2 border border-red-100 dark:border-red-900/30">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/10 active:scale-[0.99] transition-all"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t text-center text-xs">
        <span className="text-gray-400">Don't have an account?</span>{' '}
        <button onClick={onRegister} className="text-blue-600 hover:underline font-bold">
          Register here
        </button>
      </div>

      {/* Info notice about prefilled values */}
      <div className="mt-4 p-3.5 bg-blue-50/50 dark:bg-slate-900 rounded-2xl text-xs text-gray-500 border border-blue-100/50 dark:border-slate-800">
        <span className="font-bold block text-blue-800 dark:text-blue-400 mb-1">Demo Credentials Loaded:</span>
        <div className="space-y-1 mt-1 text-[11px] list-none">
          <div>• <strong>Patient:</strong> patient@healtrack.com / patient123</div>
          <div>• <strong>Doctor:</strong> doctor@healtrack.com / DOC-7729 / doctor123</div>
          <div>• <strong>Admin:</strong> admin@healtrack.com / admin123</div>
        </div>
      </div>
    </div>
  );
}

export default Login;
