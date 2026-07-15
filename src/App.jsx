import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import ForgotPasswordForm from './components/ForgotPasswordForm';
import UpdatePasswordForm from './components/UpdatePasswordForm';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Board from './pages/Board';
import Users from './pages/Users';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';

const AuthInterface = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'signup', 'forgot', 'update_password'
  const [loginEmail, setLoginEmail] = useState('');

  return (
    <div className="app-container">
      <div className="glass-panel">
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
        <Route path="/:company/tasks" element={<Tasks />} />
        <Route path="/:company/users" element={<Users />} />
        <Route path="/:company/reports" element={<Reports />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
