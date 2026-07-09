import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const LoginForm = ({ onSuccess, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailInvalid = emailTouched && !emailRegex.test(email);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setEmailTouched(false);
    setPasswordTouched(false);
    setFormSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (!email || !password) {
      setEmailTouched(true);
      setPasswordTouched(true);
      toast.error("Please fill all required fields.");
      return;
    }
    
    try {
      const loginResponse = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password })
      });
      
      if (loginResponse.ok) {
        toast.success("login success");
        resetForm();
        if (onSuccess) onSuccess();
      } else if (loginResponse.status === 404) {
        toast.error("please signup");
      } else if (loginResponse.status === 401) {
        toast.error("unable to login");
      } else {
        toast.error("unable to login");
      }
    } catch (err) {
      toast.error("Failed to connect to the backend server to login.");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
      <div className="input-group">
        <label>Email <span className="required-star">*</span></label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            id="login-email"
            name="login-email"
            type="email" 
            placeholder="Enter email address" 
            style={{ flex: 1 }} 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailTouched) setEmailTouched(true); 
            }}
            className={(isEmailInvalid || ((formSubmitted || emailTouched) && !email)) ? 'input-error' : ''}
          />
        </div>
        {isEmailInvalid && <span className="field-error">Please enter a valid email address format.</span>}
        {(formSubmitted || emailTouched) && !email && !isEmailInvalid && <span className="field-error">Email is required.</span>}
      </div>

      <div className="input-group" style={{ marginBottom: '5px' }}>
        <label>Password <span className="required-star">*</span></label>
        <input 
          id="login-password"
          name="login-password"
          type="password" 
          placeholder="Enter password" 
          value={password}
          onFocus={() => setEmailTouched(true)}
          onChange={(e) => setPassword(e.target.value)}
          className={((formSubmitted || passwordTouched) && !password) ? 'input-error' : ''}
        />
        {(formSubmitted || passwordTouched) && !password && <span className="field-error">Password is required.</span>}
      </div>
      
      <div style={{ textAlign: 'right', marginBottom: '20px' }}>
        <button 
          type="button" 
          onClick={onForgotPassword} 
          style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}
        >
          Forgot Password?
        </button>
      </div>

      <button type="submit" className="submit-btn">Login</button>
    </form>
  );
};

export default LoginForm;
