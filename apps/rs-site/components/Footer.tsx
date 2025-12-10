

import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { socialIcons } from '../config/socialIcons';
import { usePageBuilder } from '../context/PageBuilderContext';

const Footer: React.FC = () => {
  const { isAdmin, openLoginPanel, setEditMode, setActiveAdminTab } = useAdmin();
  const { settings } = useSiteSettings();
  const { globalContent } = usePageBuilder();
  const { socialLinks } = settings;

  const footerContent = globalContent.footer;
  const copyrightContent = (footerContent.content || '').replace('{YEAR}', new Date().getFullYear().toString());

  const handleAdminClick = () => {
    if (isAdmin) {
      setActiveAdminTab('home');
      setEditMode(true);
    } else {
      openLoginPanel();
    }
  };

  const handleEditSocials = () => {
    setEditMode(true);
    setActiveAdminTab('settings');
  };

  const socialLinksContent = (
    <div className="flex justify-center items-center space-x-6 mb-8">
        {socialLinks.map(link => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent transition-colors" aria-label={link.platform}>
                <SocialIcon platform={link.platform} />
            </a>
        ))}
    </div>
  );

  return (
    <footer id="contact" className="bg-black border-t border-border py-12">
      <div className="container mx-auto px-6 text-center text-text-secondary">
        <h3 className="text-2xl text-accent mb-4" dangerouslySetInnerHTML={{ __html: footerContent.title || '' }} />
        <p className="mb-6" dangerouslySetInnerHTML={{ __html: footerContent.subtitle || '' }} />
        
        {isAdmin ? (
            <div className="relative inline-block group editable-wrapper">
                {socialLinksContent}
                <button 
                    onClick={handleEditSocials}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-6 h-6 bg-accent text-button-text rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-30"
                    aria-label="Edit Social Links"
                >
                    <PencilIcon />
                </button>
            </div>
        ) : (
            socialLinksContent
        )}

        <div className="text-sm prose-static" dangerouslySetInnerHTML={{ __html: copyrightContent }} />
        <div className="mt-2">
            <button onClick={handleAdminClick} title={isAdmin ? "Admin Panel" : "Admin Login"} className="ml-2 hover:text-accent transition-colors">
                <AdminIcon />
            </button>
        </div>
      </div>
    </footer>
  );
};

const PencilIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const AdminIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 2.036c.552 0 1.08.083 1.58.243l.09.028 6.16 2.464A1 1 0 0118.5 5.75v5.332c0 2.213-1.34 4.31-3.5 5.567l-.24.141c-2.08 1.2-4.64 1.2-6.72 0l-.24-.141C5.84 15.392 4.5 13.295 4.5 11.082V5.75a1 1 0 01.67-.96l6.16-2.464.09-.028A5.952 5.952 0 0110 2.036z" clipRule="evenodd" />
    </svg>
);


const SocialIcon: React.FC<{ platform: string }> = ({ platform }) => {
    const iconData = socialIcons.find(icon => icon.platform === platform.toLowerCase());
    const iconSvg = iconData ? iconData.svg : socialIcons.find(i => i.platform === 'link')?.svg;

    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: iconSvg || '' }}>
        </svg>
    );
}

export default Footer;