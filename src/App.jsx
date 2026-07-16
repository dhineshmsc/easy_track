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
import ProtectedRoute from './components/auth/ProtectedRoute';

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
        {/* Public: Sign-in page */}
        <Route path="/" element={<AuthInterface />} />

        {/* Protected: all app pages require a valid auth cookie */}
        <Route path="/:company/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/:company/projects"  element={<ProtectedRoute element={<Projects />} />} />
        <Route path="/:company/projects/:projectId/board" element={<ProtectedRoute element={<Board />} />} />
        <Route path="/:company/tasks"     element={<ProtectedRoute element={<Tasks />} />} />
        <Route path="/:company/users"     element={<ProtectedRoute element={<Users />} />} />
        <Route path="/:company/reports"   element={<ProtectedRoute element={<Reports />} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
