import React, { useState } from 'react';
import { ArrowLeft, User, ShieldCheck } from 'lucide-react';

function Register({ onBackToLogin, onRegisterSuccess }) {
  const [role, setRole] = useState('patient'); // patient, doctor
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Patient fields
  const [age, setAge] = useState('');
  const [blood, setBlood] = useState('O+');
  const [surgery, setSurgery] = useState('');
  const [emName, setEmName] = useState('');
  const [emPhone, setEmPhone] = useState('');

  // Doctor fields
  const [hospitalId, setHospitalId] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hospital, setHospital] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (role === 'patient') {
        const patientData = {
          id: `patient_${Date.now()}`,
          name,
          email,
          age: parseInt(age) || 30,
          bloodGroup: blood,
          emergencyContactName: emName,
          emergencyContactPhone: emPhone,
          surgeryType: surgery,
          surgeryDate: new Date(),
          medicalHistory: 'None declared.',
          currentMedications: []
        };
        onRegisterSuccess(patientData, 'patient');
      } else {
        const doctorData = {
          id: `doctor_${Date.now()}`,
          name,
          email,
          hospitalId,
          specialty,
          hospital,
          experienceYears: 5,
          rating: 5.0
        };
        onRegisterSuccess(doctorData, 'doctor');
      }
    }, 1000);
  };

  return (
    <div className="max-w-xl w-full mx-auto my-8 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-gray-150 dark:border-slate-800 card-shadow">
      <button 
        onClick={onBackToLogin}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 mb-6 font-bold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Login
      </button>

      <div className="mb-6">
        <h2 className="title-font text-2xl font-extrabold text-gray-800 dark:text-gray-100">Create Account</h2>
        <p className="text-xs text-gray-400 mt-1.5 font-medium">Join HealTrack AI to monitor your recovery path</p>
      </div>

      {/* Role Picker Choice */}
      <div className="flex bg-gray-100 dark:bg-slate-900 p-1.5 rounded-2xl mb-6 max-w-xs">
        {['patient', 'doctor'].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 py-1.5 px-1 rounded-xl text-xs font-bold capitalize transition-all ${
              role === r
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-500 mb-1.5">Full Name:</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-gray-500 mb-1.5">Email Address:</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-500 mb-1.5">Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl focus:outline-none"
            required
          />
        </div>

        {role === 'patient' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-500 mb-1.5">Age:</label>
                <input 
                  type="number" 
                  value={age} 
                  onChange={e => setAge(e.target.value)} 
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1.5">Blood Group:</label>
                <select 
                  value={blood} 
                  onChange={e => setBlood(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl focus:outline-none"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-500 mb-1.5">Surgery Type (e.g. Incision location details):</label>
              <input 
                type="text" 
                placeholder="e.g. Knee Arthroplasty"
                value={surgery} 
                onChange={e => setSurgery(e.target.value)} 
                className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl focus:outline-none"
                required
              />
            </div>

            <div className="pt-2">
              <h5 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Emergency Contact details</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 mb-1.5">Contact Person Name:</label>
                  <input 
                    type="text" 
                    value={emName} 
                    onChange={e => setEmName(e.target.value)} 
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1.5">Contact Phone:</label>
                  <input 
                    type="tel" 
                    value={emPhone} 
                    onChange={e => setEmPhone(e.target.value)} 
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-500 mb-1.5">Hospital Verification ID:</label>
                <input 
                  type="text" 
                  placeholder="e.g. HOSP-9012"
                  value={hospitalId} 
                  onChange={e => setHospitalId(e.target.value)} 
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1.5">Medical Specialty:</label>
                <input 
                  type="text" 
                  placeholder="e.g. Orthopedic Surgeon"
                  value={specialty} 
                  onChange={e => setSpecialty(e.target.value)} 
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-500 mb-1.5">Affiliated Hospital Clinic Name:</label>
              <input 
                type="text" 
                placeholder="e.g. St. Jude Medical Center"
                value={hospital} 
                onChange={e => setHospital(e.target.value)} 
                className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-xl focus:outline-none"
                required
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/10 transition-all"
        >
          {loading ? 'Registering Account...' : 'Complete Registration'}
        </button>
      </form>
    </div>
  );
}

export default Register;
