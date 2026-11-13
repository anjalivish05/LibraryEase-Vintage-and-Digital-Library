import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  BookOpen,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminLoginPage({ onAdminLoginSuccess, onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Administrator email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid administrative email address.';
    }

    if (!password) {
      errors.password = 'Administrator password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.auth.adminLogin(email.trim(), password);
      if (response && response.user) {
        if (response.user.role !== 'admin') {
          setErrorMessage('Access denied: Your account does not have platform administrator privileges.');
          api.auth.logout();
          setIsLoading(false);
          return;
        }
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess(response.user);
        }
      } else {
        setErrorMessage('Authentication succeeded but administrator profile could not be verified.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      let detail = err.response?.data?.detail || err.message || 'Invalid administrator credentials.';
      if (err.status === 502 || (err.message && err.message.includes('502'))) {
        detail = 'Backend service connection error (Status 502). The server is reconnecting; please try again in a few moments.';
      } else if (err.status === 401) {
        detail = 'Invalid administrator credentials. Please check your email and master password.';
      }
      setErrorMessage(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-page-wrapper">
      <div className="admin-login-ambient-pattern" />

      {/* Top Breadcrumb Navigation */}
      <div className="admin-login-topbar">
        <button
          type="button"
          className="admin-login-back-btn"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft size={16} />
          <span>Return to Public Library</span>
        </button>
        <div className="admin-portal-badge-pill">
          <ShieldAlert size={14} />
          <span>Restricted Portal</span>
        </div>
      </div>

      <div className="admin-login-container">
        {/* Vintage Header Emblem */}
        <div className="admin-login-header-block">
          <div className="admin-login-shield-icon">
            <ShieldCheck size={34} />
          </div>
          <h1 className="admin-login-title">LibraryEase Admin Portal</h1>
          <p className="admin-login-subtitle">
            Centralized Platform Governance, Branch Management & System Administration
          </p>
          <div className="admin-login-ornament">❦</div>
        </div>

        {/* Card Form */}
        <div className="admin-login-card">
          <div className="admin-card-header">
            <h2 className="admin-card-heading">
              <KeyRound size={18} className="heading-icon" />
              <span>Administrator Authentication</span>
            </h2>
            <p className="admin-card-subtext">
              Enter your verified system administrator credentials to access the console.
            </p>
          </div>

          {errorMessage && (
            <div className="admin-login-alert-banner" role="alert">
              <AlertCircle size={18} className="alert-icon" />
              <div className="alert-text-wrap">
                <span className="alert-title">Authentication Failed</span>
                <span className="alert-detail">{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
            {/* Email Field */}
            <div className="admin-form-group">
              <label htmlFor="admin-email" className="admin-form-label">
                <span>Administrator Email</span>
                <span className="required-star">*</span>
              </label>
              <div className={`admin-input-wrapper ${fieldErrors.email ? 'has-error' : ''}`}>
                <Mail size={18} className="admin-input-icon" />
                <input
                  id="admin-email"
                  type="email"
                  className="admin-text-input"
                  placeholder="admin@libraryease.org"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.email && (
                <span className="admin-field-error">{fieldErrors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="admin-form-group">
              <label htmlFor="admin-password" className="admin-form-label">
                <span>Master Password</span>
                <span className="required-star">*</span>
              </label>
              <div className={`admin-input-wrapper ${fieldErrors.password ? 'has-error' : ''}`}>
                <Lock size={18} className="admin-input-icon" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="admin-text-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="admin-pw-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="admin-field-error">{fieldErrors.password}</span>
              )}
            </div>

            {/* Security Notice */}
            <div className="admin-login-security-notice">
              <div className="notice-icon-bullet">ℹ</div>
              <p className="notice-text">
                All administrative access sessions are cryptographically signed, timestamped, and audited against platform governance policies.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="admin-login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="admin-spinner" />
                  <span>Verifying Administrative Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Authenticate & Enter Admin Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Staff Hint */}
          <div className="admin-login-footer-hint">
            <span className="hint-label">Civic Library System Staff:</span>
            <span className="hint-text">
              Looking for circulation desk loans & returns? Visit the{' '}
              <button
                type="button"
                className="hint-link-btn"
                onClick={() => onNavigate('librarian')}
              >
                Librarian Staff Console &rarr;
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
