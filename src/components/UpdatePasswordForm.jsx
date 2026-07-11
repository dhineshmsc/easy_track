import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const UpdatePasswordForm = ({ email, onBackToLogin }) => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [oldPasswordTouched, setOldPasswordTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPasswordMismatch = confirmTouched && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (!oldPassword || !password || !confirmPassword) {
      setOldPasswordTouched(true);
      setPasswordTouched(true); 
      setConfirmTouched(true);
      toast.error("Please fill all required fields.");
      return;
    }
    
    if (password !== confirmPassword) {
      setConfirmTouched(true);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const updateResponse = await fetch(`${import.meta.env.VITE_API_URL}/update-first-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email, 
          old_password: oldPassword, 
          new_password: password 
        })
      });
      
      if (updateResponse.ok) {
        toast.success("Password updated successfully!");
        toast.success("Please login with your new password to continue.");
        onBackToLogin();
      } else {
        const errData = await updateResponse.json();
        toast.error("Failed to update password: " + (errData.detail || "Unknown error"));
      }
    } catch (err) {
      toast.error("Failed to connect to the backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px', color: '#fff', fontSize: '1.2rem' }}>Update Password</h3>
        <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
          Please change your auto-generated password.
        </p>
      </div>

      <div className="input-group">
        <label>Current Password <span className="required-star">*</span></label>
        <input 
          type="password" 
          placeholder="Enter current password" 
          value={oldPassword}
          onChange={(e) => { setOldPassword(e.target.value); setOldPasswordTouched(true); }}
          className={((formSubmitted || oldPasswordTouched) && !oldPassword) ? 'input-error' : ''}
        />
        {(formSubmitted || oldPasswordTouched) && !oldPassword && <span className="field-error">Current password is required.</span>}
      </div>

      <div className="input-group">
        <label>New Password <span className="required-star">*</span></label>
        <input 
          type="password" 
          placeholder="Enter new password" 
          value={password}
          onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
          className={(isPasswordMismatch || ((formSubmitted || passwordTouched) && !password)) ? 'input-error' : ''}
        />
        {(formSubmitted || passwordTouched) && !password && <span className="field-error">New password is required.</span>}
      </div>

      <div className="input-group">
        <label>Confirm New Password <span className="required-star">*</span></label>
        <input 
          type="password" 
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
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
          style={{ flex: 2 }}
        >
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </form>
  );
};

export default UpdatePasswordForm;
