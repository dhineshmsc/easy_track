import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import './index.css';
import bgVideo from '../static/mp4/login.mp4';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';

function App() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'forgot'

  return (
    <div className="app-container">
      <Toaster position="top-right" />
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
}

export default App;
