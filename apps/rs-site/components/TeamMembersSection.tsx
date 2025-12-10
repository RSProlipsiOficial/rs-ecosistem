


import React from 'react';
import EditableCard from './EditableCard';
import { ContentContainer } from '../types';
import { useAdmin } from '../context/AdminContext';
import { initialTeamMembers, TeamMember } from '../config/initialTeamMembers';
import { PencilSquareIcon } from './Icons';
import EditableText from './EditableText';

interface TeamMemberCardProps {
  member: TeamMember;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
  return (
    <EditableCard cardKey="team_member_card">
      <div className="text-center group p-4 h-full flex flex-col items-center">
        <div className="relative inline-block overflow-hidden rounded-full border-4 border-accent/30 w-40 h-40 mb-4 transition-all duration-300 group-hover:border-accent">
          <img
            src={member.imageUrl}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="flex-grow">
            <h3 className="text-xl text-accent mb-1" dangerouslySetInnerHTML={{__html: member.name}} />
            <h4 className="text-md text-text-primary font-semibold mb-2" dangerouslySetInnerHTML={{__html: member.title}} />
            <p className="text-text-secondary text-sm leading-relaxed" dangerouslySetInnerHTML={{__html: member.bio}} />
        </div>
      </div>
    </EditableCard>
  );
};

interface TeamMembersSectionProps {
  container: ContentContainer;
  onEdit: () => void;
  pageId: string;
}

const TeamMembersSection: React.FC<TeamMembersSectionProps> = ({ container, onEdit, pageId }) => {
  const { isAdmin, isEditMode } = useAdmin();
  const teamMemberIds = container.teamMemberIds || [];
  const teamMembersToDisplay = initialTeamMembers.filter(member => teamMemberIds.includes(member.id));

  const sectionContent = (
    <div className="container mx-auto px-6 py-24 md:py-32">
      <div className="text-center mb-16">
        <EditableText as="h2" className="text-3xl md:text-4xl section-title" pageId={pageId} containerId={container.id} fieldPath="title" htmlContent={container.title || ''} />
        <EditableText as="p" className="max-w-3xl mx-auto text-text-secondary leading-relaxed mt-6" pageId={pageId} containerId={container.id} fieldPath="subtitle" htmlContent={container.subtitle || ''} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {teamMembersToDisplay.map(member => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );

  if (isAdmin && isEditMode) {
    return (
      <div className="relative group editable-section-wrapper">
        {sectionContent}
        <div className="absolute inset-0 border-2 border-dashed border-transparent group-hover:border-accent transition-all pointer-events-none"></div>
        <button
          onClick={onEdit}
          className="absolute top-4 right-4 w-8 h-8 bg-accent text-button-text rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
          aria-label="Edit Team Members Section"
        >
          <PencilSquareIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return sectionContent;
}

export default TeamMembersSection;