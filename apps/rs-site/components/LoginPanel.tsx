


import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useLanguage } from '../context/LanguageContext';

const LoginPanel: React.FC = () => {
  const { isLoginPanelOpen, closeLoginPanel, login } = useAdmin();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoginPanelOpen) {
      // Always pre-fill credentials for quick admin access.
      setEmail('rsprolipsioficial@gmail.com');
      setPassword('Yannis784512@');

      const savedEmail = localStorage.getItem('rsprolipsi_admin_email');
      if (savedEmail) {
        setRememberMe(true);
      } else {
        setRememberMe(false);
      }
    }
  }, [isLoginPanelOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (login(email, password)) {
      if (rememberMe) {
        localStorage.setItem('rsprolipsi_admin_email', email);
        localStorage.setItem('rsprolipsi_admin_password', password);
      } else {
        localStorage.removeItem('rsprolipsi_admin_email');
        localStorage.removeItem('rsprolipsi_admin_password');
      }
      setEmail('');
      setPassword('');
      setRememberMe(false);
    } else {
      setError(t('admin_login_error'));
    }
  };
  
  const handleClose = () => {
      setEmail('');
      setPassword('');
      setError('');
      setRememberMe(false);
      closeLoginPanel();
  };

  if (!isLoginPanelOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in">
      <div className="bg-background border border-accent/30 rounded-lg shadow-2xl p-8 w-full max-w-sm relative m-4">
        <button onClick={handleClose} className="absolute top-3 right-3 text-text-secondary hover:text-text-primary transition-colors" aria-label={t('admin_login_close_aria')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-accent mb-6 text-center">{t('admin_login_title')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-text-secondary mb-2" htmlFor="email">{t('admin_login_email')}</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 text-text-primary focus:ring-accent focus:border-accent transition-colors"
              required
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block text-text-secondary mb-2" htmlFor="password">{t('admin_login_password')}</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 text-text-primary focus:ring-accent focus:border-accent transition-colors"
              required
            />
          </div>
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-accent focus:ring-accent"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-text-secondary">
              {t('admin_login_remember')}
            </label>
          </div>
          {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-button-bg text-button-text font-bold py-3 px-6 rounded-full hover:opacity-80 transition-all duration-300 transform hover:scale-105">
            {t('admin_login_button')}
          </button>
        </form>
      </div>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPanel;