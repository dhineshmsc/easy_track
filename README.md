# Easy Track - Authentication Portal

This is a modern full-stack application featuring a React + Vite frontend with a glassmorphism Apple-style UI, and a FastAPI backend powered by MongoDB for user authentication and management.

## Project Structure
- **Frontend**: React, Vite, TailwindCSS/Vanilla CSS (located in the root directory)
- **Backend**: FastAPI, Python, MongoDB (located in the `backend/` directory)

---

## 🚀 How to Start the Application

### 1. Backend Setup (FastAPI + MongoDB)
Ensure you have Python 3.8+ and MongoDB installed on your local machine. 
Your local MongoDB server should be running on the default port `27017`.

Open a terminal and navigate to the backend directory:
```bash
cd backend
```

**Create and Activate Virtual Environment:**
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

**Install Dependencies:**
```bash
pip install -r requirements.txt
```

**Set up Environment Variables:**
Copy `.env_sample` to `.env` inside the `backend` directory and fill in your SMTP credentials for OTP emails.

**Run the Backend Server:**
```bash
uvicorn main:app --reload
```
The API will be available at `http://127.0.0.1:8000`. You can view the interactive documentation at `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Setup (React + Vite)
Open a *new* terminal window in the root project directory.

**Install Dependencies:**
```bash
npm install
```

**Start the Development Server:**
```bash
npm run dev
```
Once the server starts, it will provide a local URL (usually `http://localhost:5173/`). Open this link in your browser to view the app!

---

## ✨ Features
- **Frontend**:
  - Real-time cascading form validation
  - Dynamic Sign-In / Sign-Up toggle
  - Responsive Glassmorphism UI
  - Seamless Background Video Integration
- **Backend**:
  - OTP Email Verification
  - User Registration with local MongoDB integration
  - Auto-incrementing User IDs (s.no) and UTC Timestamps
  - FastAPI async routes for performance
