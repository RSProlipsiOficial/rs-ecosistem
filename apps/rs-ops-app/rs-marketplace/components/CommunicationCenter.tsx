import React from 'react';
import CommunicationHub, {
  SharedCommunicationApi,
} from '../../../../packages/comm/src/CommunicationHub';
import communicationAPI from '../services/communicationAPI';

interface CommunicationCenterProps {
  onNavigate?: (view: string, data?: any) => void;
}

const api: SharedCommunicationApi = {
  getAnnouncements: () => communicationAPI.announcements.getAll(),
  getAgenda: () => communicationAPI.agendaItems.getAll(),
  getTrainings: () => communicationAPI.trainings.getAll(),
  getLessons: (trainingId: string) => communicationAPI.trainings.getLessons(trainingId),
  getTrainingProgress: (userId: string) => communicationAPI.trainings.getProgress(userId),
  completeLesson: (lessonId: string, userId: string, trainingId?: string) =>
    communicationAPI.trainings.completeLesson(lessonId, userId, trainingId),
  getCatalogs: () => communicationAPI.catalogs.getAll(),
  getMaterials: () => communicationAPI.downloadMaterials.getAll(),
};

const getCurrentUserId = () => {
  try {
    const profile = JSON.parse(localStorage.getItem('rs-consultant-profile') || '{}');
    return typeof profile?.id === 'string' ? profile.id : '';
  } catch {
    return '';
  }
};

const CommunicationCenter: React.FC<CommunicationCenterProps> = () => {
  return <CommunicationHub api={api} getCurrentUserId={getCurrentUserId} />;
};

export default CommunicationCenter;
