

import React from 'react';
import EditableCard from './EditableCard';
import { useAdmin } from '../context/AdminContext';
import { PencilSquareIcon } from './Icons';
import { ContentContainer } from '../types';
import EditableText from './EditableText';

interface FeatureCardProps { 
  iconSvg: string; 
  title: string; 
  description: string;
  pageId: string;
  containerId: string;
  featureIndex: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ iconSvg, title, description, pageId, containerId, featureIndex }) => (
  <EditableCard cardKey="feature_card">
    <div className="p-6 h-full">
      <div className="mb-4 text-accent">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-10 w-10"
          viewBox="0 0 24 24" 
          dangerouslySetInnerHTML={{ __html: iconSvg }}
         />
      </div>
      <EditableText as="h3" className="text-xl mb-2" pageId={pageId} containerId={containerId} fieldPath={`features.${featureIndex}.title`} htmlContent={title} />
      <EditableText as="p" className="text-text-secondary leading-relaxed" pageId={pageId} containerId={containerId} fieldPath={`features.${featureIndex}.description`} htmlContent={description} />
    </div>
  </EditableCard>
);

interface AboutSectionProps {
  container: ContentContainer;
  onEdit: () => void;
  pageId: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ container, onEdit, pageId }) => {
    const { isAdmin, isEditMode } = useAdmin();

    const sectionContent = (
         <div id="about" className="container mx-auto px-6 py-24 md:py-32">
            <div className="text-center mb-16">
              <EditableText as="h2" className="text-3xl md:text-4xl section-title" pageId={pageId} containerId={container.id} fieldPath="title" htmlContent={container.title || ''} />
              <EditableText as="p" className="max-w-3xl mx-auto text-text-secondary leading-relaxed mt-6" pageId={pageId} containerId={container.id} fieldPath="content" htmlContent={container.content || ''} />
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              <EditableCard cardKey="about_image_card">
                <div className="relative">
                    <div className="absolute -top-4 -left-4 w-full h-full border-4 border-accent/30 rounded-lg transform transition-transform duration-500 hover:scale-105"></div>
                    <img src={container.imageUrl} alt={container.altText} className="rounded-lg shadow-2xl relative z-10 w-full" />
                </div>
              </EditableCard>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {container.features?.map((feature, index) => (
                  <FeatureCard key={index} iconSvg={feature.iconSvg} title={feature.title} description={feature.description} pageId={pageId} containerId={container.id} featureIndex={index} />
                ))}
              </div>
            </div>
        </div>
    );

    if(isAdmin && isEditMode) {
        return (
            <div className="relative group editable-section-wrapper">
                {sectionContent}
                <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-accent transition-all pointer-events-none"></div>
                 <button
                    onClick={onEdit}
                    className="absolute top-4 right-4 w-8 h-8 bg-accent text-button-text rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
                    aria-label="Edit About Section"
                >
                    <PencilSquareIcon className="w-5 h-5" />
                </button>
            </div>
        )
    }

    return sectionContent;
};

export default AboutSection;