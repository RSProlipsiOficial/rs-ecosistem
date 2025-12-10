

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const ContactFormComponent: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Form submitted:', formData);
      alert(t('contact_form_alert_demo'));
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000); // Reset success message after 5 seconds
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-surface rounded-lg border border-border">
      <h2 className="text-3xl font-bold text-accent text-center mb-6">{t('contact_form_title')}</h2>
      
      {isSuccess ? (
        <div className="text-center p-4 bg-green-500/20 text-green-300 rounded-md">
          {t('contact_form_success')}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">{t('contact_form_name')}</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 text-text-primary focus:ring-accent focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">{t('contact_form_email')}</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 text-text-primary focus:ring-accent focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-text-secondary mb-1">{t('contact_form_message')}</label>
            <textarea
              name="message"
              id="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 border border-gray-600 rounded-md p-3 text-text-primary focus:ring-accent focus:border-accent"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-button-bg text-button-text font-bold py-3 px-6 rounded-full hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-wait"
            >
              {isSubmitting ? t('contact_form_sending') : t('contact_form_submit')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ContactFormComponent;