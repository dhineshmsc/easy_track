import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const ForgotPasswordForm = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [emailTouched, setEmailTouched] = useState(false);
  const [codeTouched, setCodeTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [otpStatus, setOtpStatus] = useState('none');
  const [mockOtp, setMockOtp] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailInvalid = emailTouched && !emailRegex.test(email);
  const isPasswordMismatch = confirmTouched && password !== confirmPassword;

  const handleVerifyClick = async () => {
    setEmailTouched(true);
    setOtpStatus('none');
    setMockOtp('');
    
    if (emailRegex.test(email)) {
      setIsVerifyingEmail(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/reset-password-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.otp) {
            setMockOtp(data.otp);
            toast.success(`Verification code (Mock Mode): ${data.otp}\nSent successfully to ${email}`, { duration: 4000 });
          } else {
            toast.success(`Verification code sent successfully to ${email}`);
          }
        } else {
          const errData = await response.json();
          toast.error("Failed to send OTP: " + (errData.detail || "Unknown error"));
        }
      } catch (err) {
        toast.error("Failed to connect to the backend server.");
      } finally {
        setIsVerifyingEmail(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (!email || !code || !password || !confirmPassword) {
      setEmailTouched(true); setCodeTouched(true); 
      setPasswordTouched(true); setConfirmTouched(true);
      toast.error("Please fill all required fields.");
      return;
    }
    
    if (password !== confirmPassword) {
      setConfirmTouched(true);
      return;
    }
    
    try {
      const resetResponse = await fetch(`${import.meta.env.VITE_API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code, new_password: password })
      });
      
      if (resetResponse.ok) {
        toast.success("Password reset successfully! Please login with your new password.");
        if (onBackToLogin) onBackToLogin();
      } else {
        const errData = await resetResponse.json();
        toast.error("Failed to reset password: " + (errData.detail || "Unknown error"));
        if (errData.detail === "Invalid verification code") {
            setOtpStatus('invalid');
        }
      }
    } catch (err) {
      toast.error("Failed to connect to the backend server.");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px', color: '#fff', fontSize: '1.2rem' }}>Reset Password</h3>
        <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
          Enter your email to receive a verification code.
        </p>
      </div>

      <div className="input-group">
        <label>Email <span className="required-star">*</span></label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            id="forgot-email"
            name="forgot-email"
            type="email" 
            autoComplete="new-password"
            placeholder="Enter email address" 
            style={{ flex: 1 }} 
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailTouched) setEmailTouched(true); 
              setOtpStatus('none');
            }}
            className={(isEmailInvalid || ((formSubmitted || emailTouched) && !email)) ? 'input-error' : ''}
          />
          <button 
            type="button" 
            className="verify-btn" 
            onClick={handleVerifyClick} 
            disabled={isVerifyingEmail}
            style={{ minWidth: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isVerifyingEmail ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderColor: '#ffffff transparent #ffffff transparent' }}></div> : "Verify"}
          </button>
        </div>
        {isEmailInvalid && <span className="field-error">Please enter a valid email address format.</span>}
        {(formSubmitted || emailTouched) && !email && !isEmailInvalid && <span className="field-error">Email is required.</span>}
      </div>

      <div className="input-group">
        <label>Verification Code <span className="required-star">*</span></label>
        <div style={{ position: 'relative' }}>
          {mockOtp && <span id="mock-otp-value" style={{ display: 'none' }}>{mockOtp}</span>}
          <input 
            type="text" 
            placeholder="Enter verification code" 
            value={code}
            onFocus={() => { setEmailTouched(true); }}
            onChange={(e) => {
              setCode(e.target.value);
              setOtpStatus('none');
            }}
            className={((formSubmitted || codeTouched || otpStatus === 'invalid') && !code) ? 'input-error' : ''}
            style={{ paddingRight: '45px' }}
          />
          {otpStatus === 'invalid' && (
            <div className="validation-icon-container">
              <svg className="validation-icon error" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
          )}
        </div>
        {((formSubmitted || codeTouched || otpStatus === 'invalid') && !code) && (
          <span className="field-error">Verification code is required.</span>
        )}
        {(code && otpStatus === 'invalid') && (
          <span className="field-error">Invalid verification code.</span>
        )}
      </div>

      <div className="input-group">
        <label>New Password <span className="required-star">*</span></label>
        <input 
          id="forgot-password"
          name="forgot-password"
          type="password" 
          autoComplete="new-password"
          placeholder="Enter new password" 
          value={password}
          onFocus={() => { setEmailTouched(true); setCodeTouched(true); }}
          onChange={(e) => setPassword(e.target.value)}
          className={(isPasswordMismatch || ((formSubmitted || passwordTouched) && !password)) ? 'input-error' : ''}
        />
        {(formSubmitted || passwordTouched) && !password && <span className="field-error">Password is required.</span>}
      </div>

      <div className="input-group">
        <label>Confirm New Password <span className="required-star">*</span></label>
        <input 
          type="password" 
          autoComplete="new-password"
          placeholder="Re-enter new password" 
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setConfirmTouched(true); }}
          onBlur={() => setConfirmTouched(true)}
          className={(isPasswordMismatch || (formSubmitted && !confirmPassword)) ? 'input-error' : ''}
        />
        {isPasswordMismatch && <span className="field-error">Passwords do not match</span>}
        {formSubmitted && !confirmPassword && !isPasswordMismatch && <span className="field-error">Please confirm your password.</span>}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button 
          type="button" 
          className="submit-btn" 
          onClick={onBackToLogin}
          style={{ background: 'rgba(255, 255, 255, 0.1)', flex: 1 }}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="submit-btn"
          disabled={code.length !== 6}
          style={{
            flex: 2,
            opacity: (code.length !== 6) ? 0.6 : 1,
            cursor: (code.length !== 6) ? 'not-allowed' : 'pointer'
          }}
        >
          Reset Password
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
