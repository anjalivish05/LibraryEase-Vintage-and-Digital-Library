import React, { useState, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  X, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  LogOut,
  Sparkles,
  Barcode,
  Eye,
  EyeOff
} from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState(currentUser ? 'account' : 'login'); // 'login' | 'register' | 'account'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Synchronize active tab whenever modal opens or user auth status changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(currentUser ? 'account' : 'login');
      resetMessages();
      setShowLoginPassword(false);
      setShowRegPassword(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleQuickFill = (email, pass) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    resetMessages();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.login(loginEmail.trim().toLowerCase(), loginPassword);
      setSuccessMessage(`Welcome back, ${res.user.full_name}! Digital card #${res.user.member_card_no} loaded.`);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 700);
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!regFullName.trim()) {
      setErrorMessage('Please provide your full legal or preferred name.');
      return;
    }
    if (!regEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
      setErrorMessage('Please provide a valid email address for card issuance.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.register({
        email: regEmail.trim().toLowerCase(),
        full_name: regFullName.trim(),
        phone: regPhone.trim() || null,
        password: regPassword,
        role: 'user'
      });
      setSuccessMessage(`Congratulations! Your LibraryEase card #${res.user.member_card_no} is active.`);
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Email may already be associated with a library card.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    api.auth.logout();
    onLogout();
    setActiveTab('login');
    resetMessages();
    setSuccessMessage('You have safely signed out of your library account.');
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="auth-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="auth-modal-header">
          <div className="auth-header-title-wrap">
            <div className="auth-book-emblem">
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="auth-heading">LibraryEase Patron Services</h3>
              <p className="auth-subheading">Public Library Card & Reader Circulation</p>
            </div>
          </div>
          <button
            type="button"
            className="auth-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="auth-alert error" role="alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="auth-alert success" role="status">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Tabs Navigation */}
        <div className="auth-tabs-row">
          {!currentUser ? (
            <>
              <button
                type="button"
                className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('login');
                  resetMessages();
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('register');
                  resetMessages();
                }}
              >
                Register Card
              </button>
            </>
          ) : (
            <button
              type="button"
              className="auth-tab-btn active"
            >
              My Patron Card
            </button>
          )}
        </div>

        {/* Tab 1: Login */}
        {!currentUser && activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form-body">
            {/* Quick Demo Fill Shortcut Box (Development Only) */}
            {import.meta.env.DEV && (
              <div className="auth-quick-fill-box">
                <span className="quick-fill-label">Instant Demo Credentials (Dev Mode Only):</span>
                <div className="quick-fill-btns">
                  <button
                    type="button"
                    className="quick-fill-btn patron"
                    onClick={() => handleQuickFill('patron@libraryease.org', 'patron123')}
                  >
                    <User size={13} />
                    <span>Patron (Anjali)</span>
                  </button>
                  <button
                    type="button"
                    className="quick-fill-btn librarian"
                    onClick={() => handleQuickFill('librarian@libraryease.org', 'admin123')}
                  >
                    <ShieldCheck size={13} />
                    <span>Librarian</span>
                  </button>
                </div>
              </div>
            )}

            <div className="auth-field-group">
              <label htmlFor="auth-email">Library Email Address</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-field-icon" />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="patron@libraryease.org"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label htmlFor="auth-password">Account Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-field-icon" />
                <input
                  id="auth-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="auth-input-with-toggle"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle-btn"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-primary-submit-btn"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In to My Library'}
            </button>

            <p className="auth-switch-note">
              Don't have a library card yet?{' '}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => {
                  setActiveTab('register');
                  resetMessages();
                }}
              >
                Register free civic membership
              </button>
            </p>
          </form>
        )}

        {/* Tab 2: Register */}
        {!currentUser && activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="auth-form-body">
            {/* Quick Demo Registration (Development Only) */}
            {import.meta.env.DEV && (
              <div className="auth-quick-fill-box">
                <span className="quick-fill-label">Instant Demo Registration (Dev Mode Only):</span>
                <div className="quick-fill-btns">
                  <button
                    type="button"
                    className="quick-fill-btn patron"
                    onClick={() => {
                      setRegFullName('Anjali Vishwakarma');
                      setRegEmail(`anjali.${Date.now().toString().slice(-4)}@libraryease.org`);
                      setRegPhone('+91 (022) 2284-3703');
                      setRegPassword('anjali123');
                      resetMessages();
                    }}
                  >
                    <User size={13} />
                    <span>Fill Demo Registration (Anjali)</span>
                  </button>
                </div>
              </div>
            )}

            <div className="auth-field-group">
              <label htmlFor="reg-fullname">Full Patron Name</label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-field-icon" />
                <input
                  id="reg-fullname"
                  type="text"
                  placeholder="e.g. Anjali Vishwakarma"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label htmlFor="reg-email">Email Address (for Return Reminders)</label>
              <div className="auth-input-wrapper">
                <Mail size={16} className="auth-field-icon" />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="anjali@example.org"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label htmlFor="reg-phone">Phone Number (Optional)</label>
              <div className="auth-input-wrapper">
                <Phone size={16} className="auth-field-icon" />
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label htmlFor="reg-password">Create Account Password</label>
              <div className="auth-input-wrapper">
                <Lock size={16} className="auth-field-icon" />
                <input
                  id="reg-password"
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="auth-input-with-toggle"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle-btn"
                  onClick={() => setShowRegPassword((prev) => !prev)}
                  title={showRegPassword ? 'Hide password' : 'Show password'}
                  aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-primary-submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating Member Record...' : 'Issue My Digital Card'}
            </button>

            <p className="auth-switch-note">
              Already hold a library card?{' '}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => {
                  setActiveTab('login');
                  resetMessages();
                }}
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* Tab 3: Current User Account View */}
        {currentUser && (
          <div className="auth-form-body user-profile-card">
            <div className="auth-patron-digital-card">
              <div className="patron-card-header">
                <span className="card-inst-name">LibraryEase Public System</span>
                <span className="card-badge-role">
                  {currentUser.role === 'librarian' ? 'Authorized Librarian' : 'Resident Patron'}
                </span>
              </div>

              <div className="patron-card-middle">
                <span className="patron-name-label">Cardholder</span>
                <h4 className="patron-card-name">{currentUser.full_name}</h4>
                <p className="patron-card-email">{currentUser.email}</p>
              </div>

              <div className="patron-card-bottom">
                <div>
                  <span className="patron-id-label">Card Number</span>
                  <span className="patron-card-number">{currentUser.member_card_no}</span>
                </div>
                <Barcode size={30} className="patron-barcode-icon" />
              </div>
            </div>

            <div className="auth-profile-meta-info">
              <p>
                <strong>Role:</strong> {currentUser.role === 'librarian' ? 'Staff Librarian' : 'Patron Member'}
              </p>
              {currentUser.phone && (
                <p>
                  <strong>Contact Phone:</strong> {currentUser.phone}
                </p>
              )}
              <p>
                <strong>Borrowing Privilege:</strong> Up to 5 concurrent loans (14 days standard duration).
              </p>
            </div>

            <button
              type="button"
              className="auth-logout-btn"
              onClick={handleLogoutClick}
            >
              <LogOut size={16} />
              <span>Sign Out of LibraryEase</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
