

import React from 'react';
import EditableCard from './EditableCard';
import { useAdmin } from '../context/AdminContext';
import { PencilSquareIcon } from './Icons';
import { ContentContainer } from '../types';
import EditableText from './EditableText';

interface DifferentiatorCardProps { 
    iconSvg: string; 
    title: string; 
    description: string;
    pageId: string;
    containerId: string;
    featureIndex: number;
}

const DifferentiatorCard: React.FC<DifferentiatorCardProps> = ({ iconSvg, title, description, pageId, containerId, featureIndex }) => (
    <EditableCard cardKey="differentiator_card">
        <div className="p-8 h-full text-center flex flex-col items-center">
            <div className="mb-6 text-accent">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-12 w-12"
                  viewBox="0 0 24 24" 
                  dangerouslySetInnerHTML={{ __html: iconSvg }}
                 />
            </div>
            <EditableText as="h3" className="text-2xl mb-4" pageId={pageId} containerId={containerId} fieldPath={`features.${featureIndex}.title`} htmlContent={title} />
            <EditableText as="p" className="text-text-secondary leading-relaxed flex-grow" pageId={pageId} containerId={containerId} fieldPath={`features.${featureIndex}.description`} htmlContent={description} />
        </div>
    </EditableCard>
);

interface DifferentiatorsSectionProps {
  container: ContentContainer;
  onEdit: () => void;
  pageId: string;
}

const DifferentiatorsSection: React.FC<DifferentiatorsSectionProps> = ({ container, onEdit, pageId }) => {
    const { isAdmin, isEditMode } = useAdmin();

    const sectionContent = (
        <div id="differentiators" className="container mx-auto px-6 py-24 md:py-32">
            <div className="text-center mb-16">
                <EditableText as="h2" className="text-3xl md:text-4xl section-title" pageId={pageId} containerId={container.id} fieldPath="title" htmlContent={container.title || ''} />
                <EditableText as="p" className="max-w-3xl mx-auto text-text-secondary leading-relaxed mt-6" pageId={pageId} containerId={container.id} fieldPath="subtitle" htmlContent={container.subtitle || ''} />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {container.features?.map((feature, index) => (
                    <DifferentiatorCard
                        key={index}
                        iconSvg={feature.iconSvg}
                        title={feature.title}
                        description={feature.description}
                        pageId={pageId}
                        containerId={container.id}
                        featureIndex={index}
                    />
                ))}
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
                    aria-label="Edit Differentiators Section"
                >
                    <PencilSquareIcon className="w-5 h-5" />
                </button>
            </div>
        )
    }

    return sectionContent;
};

export default DifferentiatorsSection;