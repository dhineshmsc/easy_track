"use client";
import React, { useState } from 'react';
import LoginForm from '../frontend/components/LoginForm';
import SignUpForm from '../frontend/components/SignUpForm';
import ForgotPasswordForm from '../frontend/components/ForgotPasswordForm';
import UpdatePasswordForm from '../frontend/components/UpdatePasswordForm';

export default function Home() {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'forgot', 'update_password'
  const [loginEmail, setLoginEmail] = useState('');

  return (
    <div className="app-container">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/login.mp4" type="video/mp4" />
      </video>

      <div className="glass-panel">
        {/* Brand Header */}
        <div className="brand-header">
          <img src="/logo.png" alt="Easy Track Logo" className="brand-logo" />
          <h1 className="brand-title">Easy Track</h1>
          <p className="brand-quote">Your Productivity Partner</p>
        </div>

        <div className="tab-container">
          <button 
            className={`tab ${currentView === 'login' || currentView === 'forgot' || currentView === 'update_password' ? 'active' : ''}`} 
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
              onFirstLogin={(email) => {
                setLoginEmail(email);
                setCurrentView('update_password');
              }}
            />
          )}
          {currentView === 'signup' && (
            <SignUpForm onSuccess={() => setCurrentView('login')} />
          )}
          {currentView === 'forgot' && (
            <ForgotPasswordForm onBackToLogin={() => setCurrentView('login')} />
          )}
          {currentView === 'update_password' && (
            <UpdatePasswordForm 
              email={loginEmail} 
              onBackToLogin={() => setCurrentView('login')} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
