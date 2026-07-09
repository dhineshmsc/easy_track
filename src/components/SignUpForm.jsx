import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const SignUpForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [domain, setDomain] = useState('');
  const [plan, setPlan] = useState('');
  
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [mobileTouched, setMobileTouched] = useState(false);
  const [codeTouched, setCodeTouched] = useState(false);
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [otpStatus, setOtpStatus] = useState('none');
  const [mockOtp, setMockOtp] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailInvalid = emailTouched && !emailRegex.test(email);
  const isPasswordMismatch = confirmTouched && password !== confirmPassword;

  const resetForm = () => {
    setEmail(''); setPassword(''); setConfirmPassword('');
    setName(''); setMobile(''); setCode('');
    setDomain(''); setPlan('');
    setEmailTouched(false); setPasswordTouched(false); setConfirmTouched(false);
    setNameTouched(false); setMobileTouched(false); setCodeTouched(false);
    setFormSubmitted(false); setOtpStatus('none'); setMockOtp('');
  };

  const handleVerifyClick = async () => {
    setEmailTouched(true);
    setOtpStatus('none');
    setMockOtp('');
    if (emailRegex.test(email)) {
      setIsVerifyingEmail(true);
      try {
        // Short delay so the loading icon is visible before the request completes instantly
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, purpose: 'register' })
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

  const handleVerifyOtp = async (codeToVerify) => {
    const finalCode = codeToVerify || code;
    if (!email || !finalCode) {
      setOtpStatus('invalid');
      return false;
    }
    setOtpStatus('pending');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: finalCode })
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
      toast.error("Failed to verify OTP.");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (!name || !mobile || !email || !code || !password || !confirmPassword || !domain || !plan) {
      setNameTouched(true); setMobileTouched(true); setEmailTouched(true);
      setCodeTouched(true); setPasswordTouched(true); setConfirmTouched(true);
      toast.error("Please fill all required fields.");
      return;
    }
    
    if (password !== confirmPassword) {
      setConfirmTouched(true);
      return;
    }
    
    const isValid = await handleVerifyOtp(code);
    if (!isValid) {
      toast.error("Invalid verification code. Cannot submit.");
      return;
    }
    
    try {
      const createResponse = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobile, email, code, password, domain, plan })
      });
      if (createResponse.ok) {
        const result = await createResponse.json();
        toast.success(`User created successfully!\nName: ${result.user.name}\nCompany: ${result.user.domain}`);
        resetForm();
        if (onSuccess) onSuccess();
      } else {
        const errData = await createResponse.json();
        toast.error("Failed to create user: " + (errData.detail || "Unknown error"));
      }
    } catch (err) {
      toast.error("Failed to connect to the backend server to create user.");
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
      <div className="input-group">
        <label>Name <span className="required-star">*</span></label>
        <input 
          type="text" 
          placeholder="Enter your name" 
          value={name}
          onChange={(e) => {
            if (/^[a-zA-Z\s]*$/.test(e.target.value)) setName(e.target.value);
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
            if (/^\d*$/.test(val) && val.length <= 10) setMobile(val);
          }}
          className={(formSubmitted || mobileTouched) && (!mobile || mobile.length < 10) ? 'input-error' : ''}
        />
        {(formSubmitted || mobileTouched) && !mobile && <span className="field-error">Mobile number is required.</span>}
        {(formSubmitted || mobileTouched) && mobile && mobile.length < 10 && <span className="field-error">Mobile number must be exactly 10 digits.</span>}
      </div>

      <div className="input-group">
        <label>Email <span className="required-star">*</span></label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            id="signup-email"
            name="signup-email"
            type="email" 
            autoComplete="new-password"
            placeholder="Enter email address" 
            style={{ flex: 1 }} 
            value={email}
            onFocus={() => { setNameTouched(true); setMobileTouched(true); }}
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
            onFocus={() => { setNameTouched(true); setMobileTouched(true); setEmailTouched(true); }}
            onChange={(e) => {
              const val = e.target.value;
              setCode(val);
              setOtpStatus('none');
              if (val.length === 6) handleVerifyOtp(val);
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

      <div className="input-group">
        <label>Password <span className="required-star">*</span></label>
        <input 
          id="signup-password"
          name="signup-password"
          type="password" 
          autoComplete="new-password"
          placeholder="Enter password" 
          value={password}
          onFocus={() => {
            setNameTouched(true); setMobileTouched(true); setEmailTouched(true); setCodeTouched(true);
            handleVerifyOtp();
          }}
          onChange={(e) => setPassword(e.target.value)}
          className={(isPasswordMismatch || ((formSubmitted || passwordTouched) && !password)) ? 'input-error' : ''}
        />
        {(formSubmitted || passwordTouched) && !password && <span className="field-error">Password is required.</span>}
      </div>

      <div className="input-group">
        <label>Confirm Password <span className="required-star">*</span></label>
        <input 
          type="password" 
          autoComplete="new-password"
          placeholder="Re-enter password" 
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setConfirmTouched(true); }}
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
          onFocus={() => { setConfirmTouched(true); setPasswordTouched(true); }}
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

      <button 
        type="submit" 
        className="submit-btn"
        disabled={code.length !== 6}
        style={{
          opacity: (code.length !== 6) ? 0.6 : 1,
          cursor: (code.length !== 6) ? 'not-allowed' : 'pointer'
        }}
      >
        Submit
      </button>
    </form>
  );
};

export default SignUpForm;
