import React from 'react';
import CommunicationHub, {
  SharedCommunicationApi,
} from '../../../packages/comm/src/CommunicationHub';
import { communicationService } from './services/communicationService';
import { useUser } from './ConsultantLayout';

const api: SharedCommunicationApi = {
  getAnnouncements: () => communicationService.getAnnouncements(),
  getAgenda: () => communicationService.getAgenda(),
  getTrainings: () => communicationService.getTrainings(),
  getLessons: (trainingId: string) => communicationService.getLessons(trainingId),
  getTrainingProgress: (userId: string) => communicationService.getTrainingProgress(userId),
  completeLesson: (lessonId: string, userId: string, trainingId?: string) =>
    communicationService.completeLesson(lessonId, userId, trainingId),
  getCatalogs: () => communicationService.getCatalogs(),
  getMaterials: () => communicationService.getMaterials(),
};

const Comunicacao: React.FC = () => {
  const { user } = useUser();

  return <CommunicationHub api={api} getCurrentUserId={() => user?.id || ''} />;
};

export default Comunicacao;
