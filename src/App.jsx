import React, { useState } from 'react';
import './index.css';
import bgVideo from '../static/mp4/login.mp4';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [mobile, setMobile] = useState('');
  const [mobileTouched, setMobileTouched] = useState(false);
  const [code, setCode] = useState('');
  const [codeTouched, setCodeTouched] = useState(false);
  const [domain, setDomain] = useState('');
  const [plan, setPlan] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [otpStatus, setOtpStatus] = useState('none');
  const [mockOtp, setMockOtp] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailInvalid = emailTouched && !emailRegex.test(email);
  const isPasswordMismatch = !isLogin && confirmTouched && password !== confirmPassword;

  const handleVerifyClick = async () => {
    setEmailTouched(true);
    setOtpStatus('none');
    setMockOtp('');
    if (emailRegex.test(email)) {
      try {
        const response = await fetch("http://127.0.0.1:8000/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email, name: name })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.otp) {
            setMockOtp(data.otp);
            alert("Verification code (Mock Mode): " + data.otp + "\nSent successfully to " + email);
          } else {
            alert("Verification code sent successfully to " + email);
          }
        } else {
          const errData = await response.json();
          alert("Failed to send OTP: " + (errData.detail || "Unknown error"));
        }
      } catch (err) {
        alert("Failed to connect to the backend server.");
      }
    }
  };

  const handleVerifyOtp = async (codeToVerify) => {
    const finalCode = codeToVerify || code;
    if (!email || !finalCode) {
      setOtpStatus('invalid');
      return false;
    }
    setOtpStatus('pending');
    try {
      const response = await fetch("http://127.0.0.1:8000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, otp: finalCode })
      });
      if (response.ok) {
        setOtpStatus('valid');
        return true;
      } else {
        setOtpStatus('invalid');
        return false;
      }
    } catch (err) {
      setOtpStatus('invalid');
      alert("Failed to connect to the backend server to verify OTP.");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (!isLogin) {
      if (!name || !mobile || !email || !code || !password || !confirmPassword || !domain || !plan) {
        setNameTouched(true);
        setMobileTouched(true);
        setEmailTouched(true);
        setCodeTouched(true);
        setPasswordTouched(true);
        setConfirmTouched(true);
        alert("Please fill all required fields.");
        return;
      }
      if (password !== confirmPassword) {
        setConfirmTouched(true);
        return;
      }
      
      const isValid = await handleVerifyOtp(code);
      if (!isValid) {
        alert("Invalid verification code. Cannot submit.");
        return;
      }
      
      try {
        const createResponse = await fetch("http://127.0.0.1:8000/create_user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name,
            mobile: mobile,
            email: email,
            code: code,
            password: password,
            domain: domain,
            plan: plan
          })
        });
        if (createResponse.ok) {
          const result = await createResponse.json();
          alert("User created successfully!\nName: " + result.user.name + "\nCompany: " + result.user.domain);
        } else {
          const errData = await createResponse.json();
          alert("Failed to create user: " + (errData.detail || "Unknown error"));
        }
      } catch (err) {
        alert("Failed to connect to the backend server to create user.");
      }
    } else {
      console.log('Logging in');
    }
  };

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
          <form className="auth-form" onSubmit={handleSubmit}>

            {!isLogin && (
              <>
                <div className="input-group">
                  <label>Name <span className="required-star">*</span></label>
                  <input 
                    type="text" 
                    placeholder="Enter your name" 
                    value={name}
                    onChange={(e) => {
                      if (/^[a-zA-Z\s]*$/.test(e.target.value)) {
                        setName(e.target.value);
                      }
                    }}
                    className={(formSubmitted || nameTouched) && !name ? 'input-error' : ''}
                  />
                  {(formSubmitted || nameTouched) && !name && <span className="field-error">Name is required.</span>}
                </div>
                <div className="input-group">
                  <label>Mobile Number <span className="required-star">*</span></label>
                  <input 
                    type="tel" 
                    placeholder="Enter your mobile number" 
                    value={mobile}
                    onFocus={() => setNameTouched(true)}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val) && val.length <= 10) {
                        setMobile(val);
                      }
                    }}
                    className={(formSubmitted || mobileTouched) && (!mobile || mobile.length < 10) ? 'input-error' : ''}
                  />
                  {(formSubmitted || mobileTouched) && !mobile && <span className="field-error">Mobile number is required.</span>}
                  {(formSubmitted || mobileTouched) && mobile && mobile.length < 10 && <span className="field-error">Mobile number must be exactly 10 digits.</span>}
                </div>
              </>
            )}

            <div className="input-group">
              <label>Email <span className="required-star">*</span></label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="email" 
                  placeholder="Enter email address" 
                  style={{ flex: 1 }} 
                  value={email}
                  onFocus={() => {
                    if (!isLogin) {
                      setNameTouched(true);
                      setMobileTouched(true);
                    }
                  }}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailTouched) setEmailTouched(true); 
                    setOtpStatus('none');
                  }}
                  className={(isEmailInvalid || ((formSubmitted || emailTouched) && !email)) ? 'input-error' : ''}
                />
                {!isLogin && <button type="button" className="verify-btn" onClick={handleVerifyClick}>Verify</button>}
              </div>
              {isEmailInvalid && <span className="field-error">Please enter a valid email address format.</span>}
              {(formSubmitted || emailTouched) && !email && !isEmailInvalid && <span className="field-error">Email is required.</span>}
            </div>

            {!isLogin && (
              <div className="input-group">
                <label>Verification Code <span className="required-star">*</span></label>
                <div style={{ position: 'relative' }}>
                  {mockOtp && <span id="mock-otp-value" style={{ display: 'none' }}>{mockOtp}</span>}
                  <input 
                    type="text" 
                    placeholder="Enter verification code" 
                    value={code}
                    onFocus={() => {
                      setNameTouched(true);
                      setMobileTouched(true);
                      setEmailTouched(true);
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCode(val);
                      setOtpStatus('none');
                      if (val.length === 6) {
                        handleVerifyOtp(val);
                      }
                    }}
                    className={((formSubmitted || codeTouched || otpStatus === 'invalid') && !code) ? 'input-error' : ''}
                    style={{ paddingRight: '45px' }}
                  />
                  {otpStatus === 'valid' && (
                    <div className="validation-icon-container">
                      <svg className="validation-icon success" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                  {otpStatus === 'invalid' && (
                    <div className="validation-icon-container">
                      <svg className="validation-icon error" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </div>
                  )}
                  {otpStatus === 'pending' && (
                    <div className="validation-icon-container">
                      <div className="spinner"></div>
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
            )}

            <div className="input-group">
              <label>Password <span className="required-star">*</span></label>
              <input 
                type="password" 
                placeholder="Enter password" 
                value={password}
                onFocus={() => {
                  if (!isLogin) {
                    setNameTouched(true);
                    setMobileTouched(true);
                    setEmailTouched(true);
                    setCodeTouched(true);
                    handleVerifyOtp();
                  } else {
                    setEmailTouched(true);
                  }
                }}
                onChange={(e) => setPassword(e.target.value)}
                className={(isPasswordMismatch || ((formSubmitted || passwordTouched) && !password)) ? 'input-error' : ''}
              />
              {(formSubmitted || passwordTouched) && !password && <span className="field-error">Password is required.</span>}
            </div>

            {!isLogin && (
              <>
                <div className="input-group">
                  <label>Confirm Password <span className="required-star">*</span></label>
                  <input 
                    type="password" 
                    placeholder="Re-enter password" 
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setConfirmTouched(true);
                    }}
                    onBlur={() => setConfirmTouched(true)}
                    className={(isPasswordMismatch || (formSubmitted && !confirmPassword)) ? 'input-error' : ''}
                  />
                  {isPasswordMismatch && <span className="field-error">Passwords do not match</span>}
                  {formSubmitted && !confirmPassword && !isPasswordMismatch && <span className="field-error">Please confirm your password.</span>}
                </div>
                <div className="input-group">
                  <label>Company Name <span className="required-star">*</span></label>
                  <input 
                    type="text" 
                    placeholder="e.g. Acme Corp" 
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    onFocus={() => {
                      setConfirmTouched(true);
                      setPasswordTouched(true);
                    }}
                    className={formSubmitted && !domain ? 'input-error' : ''}
                  />
                  {formSubmitted && !domain && <span className="field-error">Company Name is required.</span>}
                </div>
                <div className="input-group">
                  <label>Select Plan <span className="required-star">*</span></label>
                  <select 
                    value={plan} 
                    onChange={(e) => setPlan(e.target.value)}
                    className={formSubmitted && !plan ? 'input-error' : ''}
                  >
                    <option value="" disabled hidden>Select Plan</option>
                    <option value="free">Free</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                  {formSubmitted && !plan && <span className="field-error">Plan is required.</span>}
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="submit-btn"
              disabled={!isLogin && code.length !== 6}
              style={{
                opacity: (!isLogin && code.length !== 6) ? 0.6 : 1,
                cursor: (!isLogin && code.length !== 6) ? 'not-allowed' : 'pointer'
              }}
            >
              {isLogin ? 'Login' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
