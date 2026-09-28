# HealTrack AI - Responsive React Web Application

HealTrack AI is a modern post-surgery recovery management web application powered by simulated Computer Vision algorithms and structured clinical dashboards.

This workspace contains both the frontend subproject and backend subproject:
- **`heal_track_web`**: A modern Material 3 React web client structured with Patient, Doctor, and Admin dashboards.
- **`heal_track_backend`**: A FastAPI Python server providing image pre-processing.

---

## Workspace Map

```
HealTrackAIWeb/
├── heal_track_web/             # React Frontend Web App
│   ├── package.json            # React & Vite build configurations
│   ├── index.html              # Main viewport
│   └── src/
│       ├── main.jsx            # Entry point
│       ├── App.jsx             # Mock Router and state engine
│       ├── index.css           # Sizing & HSL theme system
│       ├── components/         # SVG charts, slides, and scanning waves
│       └── views/              # Logins, Patients, Doctors, Admins
│
└── heal_track_backend/          # FastAPI Python Server
    ├── main.py                  # API endpoints
    ├── ai_pipeline.py           # OpenCV processing
    └── requirements.txt         # Server requirements list
```

---

## Instructions to Run in VS Code

### 1. Launch React Web Frontend

1. Open VS Code terminal and navigate to the web client folder:
   ```bash
   cd heal_track_web
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Boot Vite development server:
   ```bash
   npm run dev
   ```
4. Click on the URL output (usually `http://localhost:5173`) to view in your browser.

---

### 2. Launch FastAPI Backend (Optional)

1. Open a new terminal tab and navigate to the backend folder:
   ```bash
   cd heal_track_backend
   ```
2. Install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   python main.py
   ```
4. Access docs at `http://localhost:8000/docs`.
