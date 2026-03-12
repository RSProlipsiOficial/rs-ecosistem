import React, { useEffect, useMemo, useState } from 'react';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface SharedAnnouncement {
  id: string;
  type?: string;
  title: string;
  content?: string;
  message?: string;
  is_new?: boolean;
  read?: boolean;
  created_at?: string;
}

export interface SharedAgendaItem {
  id: string;
  category?: string;
  title: string;
  content?: string;
  created_at?: string;
}

export interface SharedTraining {
  id: string;
  title: string;
  description?: string;
  iconName?: string;
  icon?: string;
  lessons?: any[];
}

export interface SharedCatalog {
  id: string;
  title: string;
  description?: string;
  cover_image?: string;
  pdf_url?: string;
}

export interface SharedMaterial {
  id: string;
  title: string;
  description?: string;
  icon_type?: string;
  file_url?: string;
  file_name?: string;
  format?: string;
}

export interface SharedCommunicationApi {
  getAnnouncements: () => Promise<ApiResponse<SharedAnnouncement[]>>;
  getAgenda: () => Promise<ApiResponse<SharedAgendaItem[]>>;
  getTrainings: () => Promise<ApiResponse<SharedTraining[]>>;
  getLessons: (trainingId: string) => Promise<ApiResponse<any[]>>;
  getTrainingProgress?: (userId: string) => Promise<ApiResponse<any[]>>;
  completeLesson?: (
    lessonId: string,
    userId: string,
    trainingId?: string
  ) => Promise<ApiResponse<null>>;
  getCatalogs: () => Promise<ApiResponse<SharedCatalog[]>>;
  getMaterials: () => Promise<ApiResponse<SharedMaterial[]>>;
}

interface SharedCommunicationHubProps {
  api: SharedCommunicationApi;
  getCurrentUserId?: () => string;
}

type Tab = 'comunicados' | 'agenda' | 'treinamentos' | 'materiais';

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

interface Lesson {
  id: string;
  title: string;
  videoId: string;
  description?: string;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  iconName: string;
  modules: Module[];
}

const BellIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

const CalendarIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" />
  </svg>
);

const BookOpenIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

const DownloadIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const DocIcon = ({ className = 'h-12 w-12' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H6.75A2.25 2.25 0 004.5 4.5v15A2.25 2.25 0 006.75 21.75h10.5A2.25 2.25 0 0019.5 19.5V18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3.75v4.5a.75.75 0 00.75.75h4.5" />
  </svg>
);

const PhotoIcon = ({ className = 'h-12 w-12' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25A1.125 1.125 0 0021.75 18.375V5.625A1.125 1.125 0 0020.625 4.5H3.375A1.125 1.125 0 002.25 5.625v12.75A1.125 1.125 0 003.375 19.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 6.75-6.75a1.125 1.125 0 011.591 0l6.159 6.159M14.25 10.5l1.5-1.5a1.125 1.125 0 011.591 0l4.409 4.409" />
  </svg>
);

const VideoIcon = ({ className = 'h-12 w-12' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-2.36a.75.75 0 011.03.67v6.38a.75.75 0 01-1.03.67l-4.72-2.36M5.25 7.5h7.5A2.25 2.25 0 0115 9.75v4.5a2.25 2.25 0 01-2.25 2.25h-7.5A2.25 2.25 0 013 14.25v-4.5A2.25 2.25 0 015.25 7.5z" />
  </svg>
);

const ChartIcon = ({ className = 'h-10 w-10' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M18 17V9m-5 8v-4m-5 4v-7" />
  </svg>
);

const UsersIcon = ({ className = 'h-10 w-10' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 00-12 0M12 14.25A4.125 4.125 0 1012 6a4.125 4.125 0 000 8.25" />
  </svg>
);

const BuildingIcon = ({ className = 'h-10 w-10' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3.75h15A.75.75 0 0120.25 4.5v16.5h-4.5V15a.75.75 0 00-.75-.75h-6a.75.75 0 00-.75.75v6H3.75V4.5a.75.75 0 01.75-.75z" />
  </svg>
);

const YouTubeIcon = ({ className = 'h-12 w-12' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.267 4.356-2.621 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z" />
  </svg>
);

const LinkIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H18m0 0v4.5M18 6l-7.5 7.5M15 10.5v7.125A1.875 1.875 0 0113.125 19.5H6.375A1.875 1.875 0 014.5 17.625V10.875A1.875 1.875 0 016.375 9H13.5" />
  </svg>
);

const DnaIcon = ({ className = 'h-10 w-10' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 3.75c0 7.5-6 9-6 16.5M9 3.75c0 7.5 6 9 6 16.5M8.25 7.5h7.5M7.5 12h9m-7.5 4.5h6" />
  </svg>
);

const RobotIcon = ({ className = 'h-10 w-10' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75h6M12 3.75v2.5m-6 4.25h12a2.25 2.25 0 012.25 2.25v4.5A2.25 2.25 0 0118 19.5H6A2.25 2.25 0 013.75 17.25v-4.5A2.25 2.25 0 016 10.5zm3 3h.008v.008H9V13.5zm6 0h.008v.008H15V13.5zM8.25 19.5v.75m7.5-.75v.75M5.25 10.5V8.25m13.5 2.25V8.25" />
  </svg>
);

const ArrowLeftIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

const PlayCircleIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 9.75 4.5 2.25-4.5 2.25v-4.5z" />
  </svg>
);

const CheckCircleIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m6 2.25a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const panelClassName =
  'rounded-[22px] border border-[#273045] bg-[linear-gradient(180deg,rgba(24,31,44,0.95),rgba(9,13,20,0.98))] shadow-[0_18px_40px_rgba(0,0,0,0.22)]';
const formatDate = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleDateString('pt-BR');
};

const getVideoId = (videoUrl?: string) => {
  if (!videoUrl) return '';
  if (videoUrl.includes('v=')) return videoUrl.split('v=')[1].split('&')[0];
  const parts = videoUrl.split('/');
  return parts[parts.length - 1] || '';
};

const resolveTrainingIcon = (iconName?: string) => {
  switch ((iconName || '').toLowerCase()) {
    case 'chart':
    case 'iconchart':
      return ChartIcon;
    case 'users':
    case 'iconusers':
      return UsersIcon;
    case 'dna':
    case 'icondna':
      return DnaIcon;
    case 'robot':
    case 'iconrobot':
      return RobotIcon;
    case 'building':
    case 'iconbuilding2':
      return BuildingIcon;
    default:
      return BookOpenIcon;
  }
};

const TabButton: React.FC<TabButtonProps> = ({ label, active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-bold transition-colors ${
      active ? 'border-brand-gold text-brand-gold' : 'border-transparent text-gray-400 hover:text-white'
    }`}
  >
    {icon}
    {label}
  </button>
);

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-brand-gray">
    <div className="h-2 rounded-full bg-brand-gold transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
  </div>
);

const AnnouncementsTab: React.FC<{ api: SharedCommunicationApi }> = ({ api }) => {
  const [items, setItems] = useState<SharedAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const result = await api.getAnnouncements();
      if (!mounted) return;
      setItems(result.success && result.data ? result.data : []);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [api]);

  const announcements = useMemo(
    () => [...items].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()),
    [items]
  );

  if (loading) return <div className="py-10 text-center text-gray-400">Carregando comunicados...</div>;

  if (announcements.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <BellIcon className="mx-auto h-10 w-10 text-gray-600" />
        <p className="mt-3">Você está em dia com os comunicados.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 justify-items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {announcements.map((item) => (
        <div
          key={item.id}
          className="flex w-[250px] max-w-full min-h-[120px] flex-col gap-3 rounded-2xl border border-[#293248] bg-[#1b2231]/75 p-3 transition-colors hover:border-brand-gold/30"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#233456] text-brand-gold">
            <BellIcon className="h-3.5 w-3.5" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-lg font-bold leading-tight text-white">
                  {item.title}
                </h3>
                {(item.content || item.message) && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-300">{item.content || item.message}</p>
                )}
              </div>
              {(item.is_new || !item.read) && (
                <span className="mt-0.5 flex-shrink-0 rounded-full bg-brand-gold px-2 py-1 text-[10px] font-bold text-brand-dark">
                  Novo
                </span>
              )}
            </div>
            <p className="mt-auto pt-2 text-xs text-gray-500">{formatDate(item.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const AgendaTab: React.FC<{ api: SharedCommunicationApi }> = ({ api }) => {
  const [items, setItems] = useState<SharedAgendaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const result = await api.getAgenda();
      if (!mounted) return;
      setItems(result.success && result.data ? result.data : []);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [api]);

  if (loading) return <div className="py-10 text-center text-gray-400">Carregando agenda...</div>;

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-[30px] font-bold text-white">
          <CalendarIcon className="h-5 w-5 text-brand-gold" />
          Agenda Corporativa
        </h2>
        {items.length > 0 ? (
          <div className="grid grid-cols-1 justify-items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="w-[250px] max-w-full min-h-[126px] rounded-xl border border-[#293248] bg-brand-gray-light p-4"
              >
                <span className="text-xs font-bold uppercase text-brand-gold">
                  {item.category || 'Agenda'}
                </span>
                <h3 className="mt-2 line-clamp-2 text-xl font-bold text-white">{item.title}</h3>
                {item.content && <p className="mt-2 line-clamp-2 text-sm text-gray-300">{item.content}</p>}
                <p className="mt-3 text-xs text-gray-500">{formatDate(item.created_at)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-brand-gray-light px-6 py-5 text-center text-gray-500">
            Nenhum item na agenda corporativa.
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-[30px] font-bold text-white">
          <UsersIcon className="h-5 w-5 text-brand-gold" />
          Aniversariantes da Rede
        </h2>
        <div className="rounded-xl bg-brand-gray-light px-6 py-5 text-center text-gray-500">
          Nenhum aniversário este mês na sua rede (até 5ª geração).
        </div>
      </section>
    </div>
  );
};

const TrainingsTab: React.FC<{
  api: SharedCommunicationApi;
  getCurrentUserId?: () => string;
}> = ({ api, getCurrentUserId }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const trainingsRes = await api.getTrainings();
      const rawTrainings = trainingsRes.success && trainingsRes.data ? trainingsRes.data : [];
      const userId = getCurrentUserId ? getCurrentUserId() : '';
      let completedLessonIds = new Set<string>();

      if (userId && api.getTrainingProgress) {
        const progressRes = await api.getTrainingProgress(userId);
        const progressRows = progressRes.success && progressRes.data ? progressRes.data : [];
        completedLessonIds = new Set(
          progressRows.map((row: any) => String(row?.lesson_id || row?.video_id || '')).filter(Boolean)
        );
      }

      const fullCourses: Course[] = await Promise.all(
        rawTrainings.map(async (training: SharedTraining) => {
          const lessonsRes = await api.getLessons(training.id);
          const lessons = lessonsRes.success && lessonsRes.data ? lessonsRes.data : [];
          const mappedLessons: Lesson[] = [...lessons]
            .sort((a: any, b: any) => Number(a?.order_index || 0) - Number(b?.order_index || 0))
            .map((lesson: any) => ({
              id: String(lesson.id),
              title: String(lesson.title || ''),
              videoId: getVideoId(lesson.video_url),
              completed: completedLessonIds.has(String(lesson.id)),
            }));

          return {
            id: String(training.id),
            title: String(training.title || ''),
            description: String(training.description || ''),
            iconName: String(training.iconName || 'IconBookOpen'),
            modules: [
              {
                id: String(training.id),
                title: 'Aulas do Treinamento',
                lessons: mappedLessons,
              },
            ],
          };
        })
      );

      if (!mounted) return;
      setCourses(fullCourses);
      setLoading(false);
    };

    load();
    return () => {
      mounted = false;
    };
  }, [api, getCurrentUserId]);

  useEffect(() => {
    if (!selectedCourse || selectedLessonId) return;
    const firstLessonId = selectedCourse.modules[0]?.lessons[0]?.id;
    if (firstLessonId) setSelectedLessonId(firstLessonId);
  }, [selectedCourse, selectedLessonId]);

  useEffect(() => {
    setDetailTab('visao-geral');
  }, [selectedCourse, selectedLessonId]);

  const courseProgress = useMemo(
    () =>
      courses.reduce<Record<string, number>>((acc, course) => {
        const lessons = course.modules.flatMap((module) => module.lessons);
        const completed = lessons.filter((lesson) => lesson.completed).length;
        acc[course.id] = lessons.length > 0 ? (completed / lessons.length) * 100 : 0;
        return acc;
      }, {}),
    [courses]
  );

  const iconMap: Record<string, React.ElementType> = {
    IconBookOpen: BookOpenIcon,
    IconChart: ChartIcon,
    IconUsers: UsersIcon,
    IconBuilding2: BuildingIcon,
  };

  const handleToggleLesson = async (courseId: string, moduleId: string, lessonId: string) => {
    const userId = getCurrentUserId ? getCurrentUserId() : '';
    if (!userId || !api.completeLesson) return;
    const result = await api.completeLesson(lessonId, userId, courseId);
    if (!result.success) return;

    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course.id !== courseId) return course;
        return {
          ...course,
          modules: course.modules.map((module) => {
            if (module.id !== moduleId) return module;
            return {
              ...module,
              lessons: module.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, completed: !lesson.completed } : lesson
              ),
            };
          }),
        };
      })
    );
  };

  if (loading) return <div className="py-10 text-center text-gray-400">Carregando treinamentos...</div>;

  if (selectedCourse) {
    const currentCourseState = courses.find((course) => course.id === selectedCourse.id) || selectedCourse;
    const totalLessons = currentCourseState.modules.flatMap((module) => module.lessons).length;
    const completedLessons = currentCourseState.modules.flatMap((module) => module.lessons).filter((lesson) => lesson.completed).length;
    const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    const activeLesson = currentCourseState.modules.flatMap((module) => module.lessons).find((lesson) => lesson.id === selectedLessonId);

    return (
      <div className="animate-fade-in space-y-6">
        <button
          onClick={() => {
            setSelectedCourse(null);
            setSelectedLessonId(null);
          }}
          className="mb-4 font-semibold text-brand-gold hover:underline"
        >
          &larr; Voltar para todos os cursos
        </button>

        <div>
          <h2 className="text-3xl font-bold text-white">{currentCourseState.title}</h2>
          <p className="mt-1 text-gray-400">{currentCourseState.description}</p>
          <div className="mt-4">
            <ProgressBar progress={overallProgress} />
            <p className="mt-1 text-right text-sm text-gray-400">
              {completedLessons} de {totalLessons} aulas concluídas
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="aspect-video overflow-hidden rounded-xl border border-brand-gray bg-black">
              {activeLesson?.videoId ? (
                <iframe
                  key={activeLesson.id}
                  width="100%"
                  height="100%"
                  src={`https://www.youtube-nocookie.com/embed/${activeLesson.videoId}`}
                  title={activeLesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-gray-500">
                  <YouTubeIcon className="mb-2 opacity-50" />
                  <p>Nenhum vídeo disponível para esta aula.</p>
                </div>
              )}
            </div>

            {activeLesson && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">{activeLesson.title}</h2>
                <div className="flex items-center gap-2 border-t border-brand-gray py-4">
                  <input
                    type="checkbox"
                    id={`complete-${activeLesson.id}`}
                    checked={activeLesson.completed}
                    onChange={() => {
                      const mod = currentCourseState.modules.find((module) =>
                        module.lessons.some((lesson) => lesson.id === activeLesson.id)
                      );
                      if (mod) handleToggleLesson(currentCourseState.id, mod.id, activeLesson.id);
                    }}
                    className="h-5 w-5 cursor-pointer rounded border-brand-gray-light bg-brand-gray text-brand-gold focus:ring-brand-gold"
                    disabled={!api.completeLesson || !(getCurrentUserId && getCurrentUserId())}
                  />
                  <label htmlFor={`complete-${activeLesson.id}`} className="text-sm font-medium text-gray-300">
                    Marcar aula como concluída
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex max-h-[70vh] flex-col rounded-xl border border-brand-gray bg-brand-gray-light/30 p-4">
            <h3 className="mb-4 text-xl font-bold text-white">Aulas do Treinamento</h3>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              {currentCourseState.modules.map((module) => {
                const moduleTotal = module.lessons.length;
                const moduleCompleted = module.lessons.filter((lesson) => lesson.completed).length;
                const moduleProgress = moduleTotal > 0 ? (moduleCompleted / moduleTotal) * 100 : 0;

                return (
                  <div key={module.id} className="space-y-3">
                    <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
                      <span className="font-bold text-gray-300">{module.title}</span>
                      <span>{moduleCompleted}/{moduleTotal}</span>
                    </div>
                    <ProgressBar progress={moduleProgress} />
                    <div className="mt-3 space-y-2">
                      {module.lessons.map((lesson, idx) => (
                        <div
                          key={lesson.id}
                          onClick={() => setSelectedLessonId(lesson.id)}
                          className={`group flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors ${
                            selectedLessonId === lesson.id ? 'border border-brand-gold/30 bg-brand-gold/10' : 'bg-brand-gray-light hover:bg-brand-gray'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={lesson.completed}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleToggleLesson(currentCourseState.id, module.id, lesson.id);
                              }}
                              className="h-4 w-4 cursor-pointer rounded border-brand-gray-light bg-brand-gray text-brand-gold focus:ring-brand-gold"
                              disabled={!api.completeLesson || !(getCurrentUserId && getCurrentUserId())}
                            />
                            <span className={`text-sm ${selectedLessonId === lesson.id ? 'font-bold text-brand-gold' : lesson.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                              Aula {idx + 1}: {lesson.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Central de Treinamentos</h2>
        <p className="mt-1 text-gray-400">Capacite-se e impulsione seus resultados.</p>
      </div>

      {courses.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          <BookOpenIcon className="mx-auto h-10 w-10 text-gray-600" />
          <p className="mt-2 text-gray-400">Nenhum treinamento disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 justify-items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => {
            const progress = courseProgress[course.id] || 0;
            const Icon = iconMap[course.iconName] || BookOpenIcon;
            return (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="flex h-full w-[250px] max-w-full min-h-[240px] cursor-pointer flex-col rounded-xl border border-brand-gray bg-brand-gray-light p-4 text-left transition-colors hover:border-brand-gold/50"
              >
                <Icon className="mb-4 h-8 w-8 text-brand-gold" />
                <h3 className="h-12 line-clamp-2 text-lg font-bold text-white">{course.title}</h3>
                <p className="mt-2 h-16 overflow-hidden text-sm text-gray-400">{course.description}</p>
                <div className="mt-auto pt-4">
                  <ProgressBar progress={progress} />
                  <p className="mt-2 text-right text-sm text-gray-400">{Math.round(progress)}% Concluído</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const TrainingsTabRotaFacil: React.FC<{
  api: SharedCommunicationApi;
  getCurrentUserId?: () => string;
}> = ({ api, getCurrentUserId }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'visao-geral' | 'materiais' | 'ia'>('visao-geral');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const trainingsRes = await api.getTrainings();
      const rawTrainings = trainingsRes.success && trainingsRes.data ? trainingsRes.data : [];
      const userId = getCurrentUserId ? getCurrentUserId() : '';
      let completedLessonIds = new Set<string>();

      if (userId && api.getTrainingProgress) {
        const progressRes = await api.getTrainingProgress(userId);
        const progressRows = progressRes.success && progressRes.data ? progressRes.data : [];
        completedLessonIds = new Set(
          progressRows.map((row: any) => String(row?.lesson_id || row?.video_id || '')).filter(Boolean)
        );
      }

      const fullCourses: Course[] = await Promise.all(
        rawTrainings.map(async (training: SharedTraining) => {
          const embeddedLessons = Array.isArray((training as any).lessons) ? (training as any).lessons : [];
          const lessonsRes = embeddedLessons.length > 0 ? null : await api.getLessons(training.id);
          const lessons =
            embeddedLessons.length > 0
              ? embeddedLessons
              : lessonsRes?.success && lessonsRes.data
                ? lessonsRes.data
                : [];

          const mappedLessons: Lesson[] = [...lessons]
            .sort(
              (a: any, b: any) =>
                Number(a?.order_index || a?.order || a?.ordem || 0) -
                Number(b?.order_index || b?.order || b?.ordem || 0)
            )
            .map((lesson: any) => ({
              id: String(lesson.id),
              title: String(lesson.title || lesson.titulo || ''),
              description: String(lesson.description || lesson.descricao || ''),
              videoId: getVideoId(lesson.youtubeUrl || lesson.video_url || lesson.link_video),
              completed: completedLessonIds.has(String(lesson.id)),
            }));

          return {
            id: String(training.id),
            title: String(training.title || ''),
            description: String(training.description || ''),
            iconName: String(training.iconName || training.icon || 'book'),
            modules: [
              {
                id: String(training.id),
                title: 'Aulas do Treinamento',
                lessons: mappedLessons,
              },
            ],
          };
        })
      );

      if (!mounted) return;
      setCourses(fullCourses);
      setLoading(false);
    };

    load();
    return () => {
      mounted = false;
    };
  }, [api, getCurrentUserId]);

  useEffect(() => {
    if (!selectedCourse || selectedLessonId) return;
    const firstLessonId = selectedCourse.modules[0]?.lessons[0]?.id;
    if (firstLessonId) setSelectedLessonId(firstLessonId);
  }, [selectedCourse, selectedLessonId]);

  const courseProgress = useMemo(
    () =>
      courses.reduce<Record<string, number>>((acc, course) => {
        const lessons = course.modules.flatMap((module) => module.lessons);
        const completed = lessons.filter((lesson) => lesson.completed).length;
        acc[course.id] = lessons.length > 0 ? (completed / lessons.length) * 100 : 0;
        return acc;
      }, {}),
    [courses]
  );

  const handleToggleLesson = async (courseId: string, moduleId: string, lessonId: string) => {
    const userId = getCurrentUserId ? getCurrentUserId() : '';
    if (!userId || !api.completeLesson) return;
    const result = await api.completeLesson(lessonId, userId, courseId);
    if (!result.success) return;

    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course.id !== courseId) return course;
        return {
          ...course,
          modules: course.modules.map((module) => {
            if (module.id !== moduleId) return module;
            return {
              ...module,
              lessons: module.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, completed: !lesson.completed } : lesson
              ),
            };
          }),
        };
      })
    );
  };

  if (loading) return <div className="py-10 text-center text-gray-400">Carregando treinamentos...</div>;

  if (selectedCourse) {
    const currentCourseState = courses.find((course) => course.id === selectedCourse.id) || selectedCourse;
    const totalLessons = currentCourseState.modules.flatMap((module) => module.lessons).length;
    const completedLessons = currentCourseState.modules.flatMap((module) => module.lessons).filter((lesson) => lesson.completed).length;
    const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    const activeLesson = currentCourseState.modules.flatMap((module) => module.lessons).find((lesson) => lesson.id === selectedLessonId);

    return (
      <div className="animate-fade-in space-y-6">
        <div className="space-y-3">
          <button
            onClick={() => {
              setSelectedCourse(null);
              setSelectedLessonId(null);
            }}
            className="inline-flex items-center gap-2 font-semibold text-brand-gold hover:underline"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Voltar para todos os cursos
          </button>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white">{currentCourseState.title}</h2>
            <p className="mt-2 max-w-3xl text-gray-400">
              {currentCourseState.description || 'Capacite-se e impulsione seus resultados com nossos treinamentos exclusivos.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-brand-gray bg-black shadow-2xl">
              <div className="aspect-video">
                {activeLesson?.videoId ? (
                  <iframe
                    key={activeLesson.id}
                    width="100%"
                    height="100%"
                    src={`https://www.youtube-nocookie.com/embed/${activeLesson.videoId}`}
                    title={activeLesson.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-gray-500">
                    <YouTubeIcon className="mb-2 opacity-50" />
                    <p>Nenhum vídeo disponível para esta aula.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#293248] bg-[#121212] p-6">
              {activeLesson ? (
                <div className="space-y-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="mt-2 text-2xl font-black text-white">{activeLesson.title}</h3>
                      <p className="mt-2 text-sm text-gray-400">
                        Aula {currentCourseState.modules[0]?.lessons.findIndex((lesson) => lesson.id === activeLesson.id)! + 1} • {currentCourseState.title}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const mod = currentCourseState.modules.find((module) =>
                          module.lessons.some((lesson) => lesson.id === activeLesson.id)
                        );
                        if (mod) handleToggleLesson(currentCourseState.id, mod.id, activeLesson.id);
                      }}
                      disabled={!api.completeLesson || !(getCurrentUserId && getCurrentUserId())}
                      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-black transition-colors ${
                        activeLesson.completed
                          ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'bg-brand-gold text-black hover:bg-[#f6d54f]'
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      {activeLesson.completed ? 'Aula concluida' : 'Marcar como Concluida'}
                    </button>
                  </div>
                  <div className="rounded-full border border-[#2b3345] bg-[#0f131b] p-1">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'visao-geral', label: 'Visao Geral' },
                        { key: 'materiais', label: 'Materiais' },
                        { key: 'ia', label: 'Assistente IA' },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setDetailTab(tab.key as 'visao-geral' | 'materiais' | 'ia')}
                          className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                            detailTab === tab.key
                              ? 'bg-brand-gold text-black'
                              : 'text-gray-300 hover:bg-white/5'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-[#283247] pt-4 text-sm leading-7 text-gray-300">
                    {detailTab === 'visao-geral' && (
                      <div className="space-y-4">
                        <p>{activeLesson.description || 'Sem descricao adicional para esta aula.'}</p>
                        <p className="text-gray-400">
                          Progresso do treinamento: {Math.round(overallProgress)}% • {completedLessons} de {totalLessons} aulas concluidas.
                        </p>
                      </div>
                    )}
                    {detailTab === 'materiais' && (
                      <div className="rounded-2xl border border-dashed border-[#2a3345] px-5 py-8 text-center text-gray-500">
                        Nenhum material complementar anexado a esta aula.
                      </div>
                    )}
                    {detailTab === 'ia' && (
                      <div className="rounded-2xl border border-dashed border-[#2a3345] px-5 py-8 text-center text-gray-500">
                        Assistente IA indisponivel nesta integracao do marketplace.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-gray-500">
                  Selecione uma aula para visualizar os detalhes.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#293248] bg-[#121212] p-0 overflow-hidden">
            <div className="max-h-[740px] overflow-y-auto">
              {currentCourseState.modules.map((module) => {
                const moduleTotal = module.lessons.length;
                const moduleCompleted = module.lessons.filter((lesson) => lesson.completed).length;
                const moduleProgress = moduleTotal > 0 ? (moduleCompleted / moduleTotal) * 100 : 0;

                return (
                  <div key={module.id} className="border-b border-[#202838] last:border-b-0">
                    <div className="px-5 py-4 text-xs font-black uppercase tracking-[0.22em] text-gray-500">
                      {module.title} • {moduleCompleted}/{moduleTotal}
                    </div>
                    <div className="px-5 pb-4">
                      <ProgressBar progress={moduleProgress} />
                    </div>
                    <div className="space-y-0">
                      {module.lessons.map((lesson, idx) => (
                        <div
                          key={lesson.id}
                          onClick={() => setSelectedLessonId(lesson.id)}
                          className={`group flex cursor-pointer items-start gap-4 border-t border-[#202838] px-5 py-5 transition-colors ${
                            selectedLessonId === lesson.id ? 'bg-[#171d28]' : 'bg-transparent hover:bg-[#151b24]'
                          }`}
                        >
                          <div className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                            selectedLessonId === lesson.id
                              ? 'border-brand-gold text-brand-gold'
                              : 'border-[#3c4556] text-gray-400'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className={`text-sm font-bold ${
                                  selectedLessonId === lesson.id ? 'text-white' : 'text-gray-200'
                                }`}>
                                  {lesson.title}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                  Video • {lesson.completed ? 'Concluida' : 'Nao concluida'}
                                </p>
                              </div>
                              {lesson.completed && <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-400" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Central de Treinamentos</h2>
        <p className="mt-1 text-gray-400">Capacite-se e impulsione seus resultados com os treinamentos publicados no admin.</p>
      </div>

      {courses.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          <BookOpenIcon className="mx-auto h-10 w-10 text-gray-600" />
          <p className="mt-2 text-gray-400">Nenhum treinamento disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const progress = courseProgress[course.id] || 0;
            const Icon = resolveTrainingIcon(course.iconName);
            return (
              <div
                key={course.id}
                className="group flex h-full flex-col rounded-[24px] border border-[#283247] bg-[#121212] p-2 text-left transition-all hover:border-brand-gold/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
              >
                <div className="flex h-full flex-col rounded-[20px] bg-[#121212] p-8">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="text-brand-gold">
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="mb-3 text-2xl font-black tracking-tight text-white transition-colors group-hover:text-brand-gold">
                    {course.title}
                  </h3>
                  <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-gray-500">
                    {course.description || 'Domine novas habilidades e escale seu negócio.'}
                  </p>

                  <div className="mt-auto flex flex-col gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.22em] text-gray-500">
                        <span>Progresso</span>
                        <span className="text-gray-400">{Math.round(progress)}%</span>
                      </div>
                      <ProgressBar progress={progress} />
                    </div>

                    <button
                      onClick={() => setSelectedCourse(course)}
                      className={`w-full rounded-2xl px-6 py-4 text-lg font-black transition-all ${
                        progress === 100
                          ? 'border border-brand-gold/20 bg-[#1a1a1a] text-brand-gold hover:bg-[#222]'
                          : 'bg-[#1a1a1a] text-white hover:bg-brand-gold hover:text-black'
                      }`}
                    >
                      {progress === 100 ? 'Concluir' : 'Acessar Aula'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CatalogsTab: React.FC<{ api: SharedCommunicationApi }> = ({ api }) => {
  const [items, setItems] = useState<SharedCatalog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const result = await api.getCatalogs();
      if (!mounted) return;
      setItems(result.success && result.data ? result.data : []);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [api]);

  if (loading) return <div className="py-10 text-center text-gray-400">Carregando catálogos...</div>;

  if (items.length === 0) {
    return (
      <div className="animate-fade-in py-16 text-center text-gray-500">
        <DocIcon className="mx-auto text-brand-gold" />
        <h2 className="mt-4 text-2xl font-bold text-white">Catálogos</h2>
        <p className="mx-auto mt-2 max-w-lg">Nenhum caderno ou catálogo disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in grid grid-cols-1 justify-items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((catalog) => (
        <div key={catalog.id} className="group flex h-full w-[250px] max-w-full flex-col rounded-xl border border-brand-gray bg-brand-gray-light p-3 transition-colors hover:border-brand-gold">
          <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-lg bg-brand-gray-light">
            {catalog.cover_image ? (
              <img src={catalog.cover_image} alt={catalog.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-600">
                <DocIcon className="h-16 w-16" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <a href={catalog.pdf_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-brand-gold px-4 py-2 font-bold text-brand-dark">
                <LinkIcon />
                Visualizar
              </a>
            </div>
          </div>
          <h3 className="line-clamp-2 text-sm font-bold text-white">{catalog.title}</h3>
          {catalog.description && <p className="mt-2 line-clamp-3 flex-1 text-xs text-gray-400">{catalog.description}</p>}
        </div>
      ))}
    </div>
  );
};

const MaterialsTab: React.FC<{ api: SharedCommunicationApi }> = ({ api }) => {
  const [items, setItems] = useState<SharedMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const result = await api.getMaterials();
      if (!mounted) return;
      setItems(result.success && result.data ? result.data : []);
      setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [api]);

  const getIcon = (item: SharedMaterial) => {
    if (item.icon_type === 'photo') return PhotoIcon;
    if (item.file_name?.endsWith('.png') || item.file_name?.endsWith('.jpg')) return PhotoIcon;
    if (item.file_name?.endsWith('.mp4')) return VideoIcon;
    return DocIcon;
  };

  if (loading) return <div className="py-10 text-center text-gray-400">Carregando materiais...</div>;

  return (
    <div className="animate-fade-in">
      <h2 className="mb-6 text-2xl font-bold text-white">Materiais para Download</h2>
      {items.length === 0 ? (
        <p className="py-10 text-center text-gray-500">Nenhum material disponível para download.</p>
      ) : (
        <div className="grid grid-cols-1 justify-items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((asset) => {
            const Icon = getIcon(asset);
            return (
              <div key={asset.id} className="flex h-full w-[250px] max-w-full flex-col rounded-xl border border-brand-gray bg-brand-gray-light p-3 transition-colors hover:border-brand-gold/50">
                <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-brand-gray-dark">
                  {asset.icon_type === 'photo' && asset.file_url ? (
                    <img src={asset.file_url} alt={asset.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Icon className="h-12 w-12 text-brand-text-dim" />
                    </div>
                  )}
                </div>
                <div className="mt-3 flex-grow">
                  <h3 className="line-clamp-2 text-sm font-semibold text-white">{asset.title}</h3>
                  {asset.description && <p className="mt-1 line-clamp-3 text-xs text-gray-400">{asset.description}</p>}
                  {asset.format && <p className="mt-2 text-xs uppercase text-brand-gold">{asset.format}</p>}
                </div>
                <a href={asset.file_url} download target="_blank" rel="noopener noreferrer" className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gold px-3 py-2 text-sm font-bold text-brand-dark transition-colors hover:bg-yellow-400">
                  <DownloadIcon className="h-4 w-4" />
                  <span>Baixar</span>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CommunicationHub: React.FC<SharedCommunicationHubProps> = ({ api, getCurrentUserId }) => {
  const [activeTab, setActiveTab] = useState<Tab>('comunicados');

  const renderContent = () => {
    switch (activeTab) {
      case 'comunicados':
        return <AnnouncementsTab api={api} />;
      case 'agenda':
        return <AgendaTab api={api} />;
      case 'treinamentos':
        void TrainingsTab;
        return <TrainingsTabRotaFacil api={api} getCurrentUserId={getCurrentUserId} />;
      case 'materiais':
        return (
          <div className="space-y-10">
            <CatalogsTab api={api} />
            <div className="border-t border-[#283247]" />
            <MaterialsTab api={api} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-brand-gold">Central de Comunicação e Conteúdo</h1>
      <div className={`${panelClassName} p-5 md:p-6`}>
        <div className="mb-6 border-b border-[#283247]">
          <div className="flex items-center overflow-x-auto space-x-1">
            <TabButton label="Mural de Comunicados" active={activeTab === 'comunicados'} onClick={() => setActiveTab('comunicados')} icon={<BellIcon />} />
            <TabButton label="Agenda Comemorativa" active={activeTab === 'agenda'} onClick={() => setActiveTab('agenda')} icon={<CalendarIcon />} />
            <TabButton label="Central de Treinamentos" active={activeTab === 'treinamentos'} onClick={() => setActiveTab('treinamentos')} icon={<BookOpenIcon />} />
            <TabButton label="Materiais de Apoio" active={activeTab === 'materiais'} onClick={() => setActiveTab('materiais')} icon={<DownloadIcon />} />
          </div>
        </div>
        <div className="animate-fade-in">{renderContent()}</div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default CommunicationHub;
