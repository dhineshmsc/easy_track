import React, { useState } from 'react';
import './index.css';
import bgVideo from '../static/mp4/login.mp4';

function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="app-container">
      <video autoPlay loop muted className="background-video">
        <source src={bgVideo} type="video/mp4" />
      </video>
      <div className="overlay"></div>
      
      <div className="glass-panel">
        <div className="tab-container">
          <button 
            className={`tab ${isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button 
            className={`tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <div className="form-container">
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <label>Username</label>
              <input type="text" placeholder="Enter username" />
            </div>

            {!isLogin && (
              <div className="input-group">
                <label>Email</label>
                <input type="email" placeholder="Enter email address" />
              </div>
            )}

            <div className="input-group">
              <label>Password</label>
              <input type="password" placeholder="Enter password" />
            </div>

            {!isLogin && (
              <>
                <div className="input-group">
                  <label>Company Domain</label>
                  <input type="text" placeholder="e.g. acme.com" />
                </div>
                <div className="input-group">
                  <label>Select Plan</label>
                  <select>
                    <option value="free">Free</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
              </>
            )}

            <button type="submit" className="submit-btn">
              {isLogin ? 'Login' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
