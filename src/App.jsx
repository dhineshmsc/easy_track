import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import bgVideo from '../static/mp4/login.mp4';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Board from './pages/Board';

const AuthInterface = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'forgot'

  return (
    <div className="app-container">
      <video autoPlay loop muted className="background-video">
        <source src={bgVideo} type="video/mp4" />
      </video>
      <div className="overlay"></div>
      
      <div className="glass-panel">
        <div className="tab-container">
          <button 
            className={`tab ${currentView === 'login' || currentView === 'forgot' ? 'active' : ''}`} 
            onClick={() => setCurrentView('login')}
          >
            Sign In
          </button>
          <button 
            className={`tab ${currentView === 'signup' ? 'active' : ''}`} 
            onClick={() => setCurrentView('signup')}
          >
            Sign Up
          </button>
        </div>

        <div className="form-container">
          {currentView === 'login' && (
            <LoginForm 
              onSuccess={() => setCurrentView('login')} 
              onForgotPassword={() => setCurrentView('forgot')} 
            />
          )}
          {currentView === 'signup' && (
            <SignUpForm onSuccess={() => setCurrentView('login')} />
          )}
          {currentView === 'forgot' && (
            <ForgotPasswordForm onBackToLogin={() => setCurrentView('login')} />
          )}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<AuthInterface />} />
        <Route path="/:company/dashboard" element={<Dashboard />} />
        <Route path="/:company/projects" element={<Projects />} />
        <Route path="/:company/projects/:projectId/board" element={<Board />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
