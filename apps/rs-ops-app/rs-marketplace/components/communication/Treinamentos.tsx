import React, { useEffect, useMemo, useState } from 'react';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import { BuildingStorefrontIcon } from '../icons/BuildingStorefrontIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import { YouTubeIcon } from '../icons/YouTubeIcon';
import communicationAPI from '../../services/communicationAPI';

interface Lesson {
  id: string;
  title: string;
  videoId: string;
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

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-brand-gray">
    <div
      className="h-2 rounded-full bg-brand-gold transition-all duration-500 ease-out"
      style={{ width: `${progress}%` }}
    />
  </div>
);

const availableIcons: Record<string, React.ElementType> = {
  IconBookOpen: BookOpenIcon,
  IconChart: ChartBarIcon,
  IconUsers: UserGroupIcon,
  IconBuilding2: BuildingStorefrontIcon,
};

const getStoredUserId = () => {
  try {
    const profile = JSON.parse(localStorage.getItem('rs-consultant-profile') || '{}');
    return typeof profile?.id === 'string' ? profile.id : '';
  } catch {
    return '';
  }
};

const getVideoId = (videoUrl?: string) => {
  if (!videoUrl) return '';
  if (videoUrl.includes('v=')) {
    return videoUrl.split('v=')[1].split('&')[0];
  }
  const parts = videoUrl.split('/');
  return parts[parts.length - 1] || '';
};

const Treinamentos: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadTrainings = async () => {
      setLoading(true);

      try {
        const trainingsRes = await communicationAPI.trainings.getAll();
        const rawTrainings = trainingsRes.success && trainingsRes.data ? trainingsRes.data : [];
        const userId = getStoredUserId();
        let completedLessonIds = new Set<string>();

        if (userId) {
          const progressRes = await communicationAPI.trainings.getProgress(userId);
          const progressRows = progressRes.success && progressRes.data ? progressRes.data : [];
          completedLessonIds = new Set(
            progressRows
              .map((row: any) => String(row?.lesson_id || row?.video_id || ''))
              .filter(Boolean)
          );
        }

        const fullCourses: Course[] = await Promise.all(
          rawTrainings.map(async (training: any) => {
            const lessonsRes = await communicationAPI.trainings.getLessons(training.id);
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
              iconName: String((training as any).iconName || 'IconBookOpen'),
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

        if (mounted) setCourses(fullCourses);
      } catch (error) {
        console.error('Error loading trainings:', error);
        if (mounted) setCourses([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTrainings();

    return () => {
      mounted = false;
    };
  }, []);

  const courseProgress = useMemo(() => {
    return courses.reduce<Record<string, number>>((acc, course) => {
      const lessons = course.modules.flatMap((module) => module.lessons);
      const completed = lessons.filter((lesson) => lesson.completed).length;
      const total = lessons.length;
      acc[course.id] = total > 0 ? (completed / total) * 100 : 0;
      return acc;
    }, {});
  }, [courses]);

  const handleToggleLesson = async (courseId: string, moduleId: string, lessonId: string) => {
    const userId = getStoredUserId();
    if (!userId) return;

    const result = await communicationAPI.trainings.completeLesson(lessonId, userId, courseId);
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

  if (loading) {
    return <div className="py-10 text-center text-gray-400">Carregando treinamentos...</div>;
  }

  if (selectedCourse) {
    const currentCourseState = courses.find((course) => course.id === selectedCourse.id) || selectedCourse;
    const totalLessons = currentCourseState.modules.flatMap((module) => module.lessons).length;
    const completedLessons = currentCourseState.modules
      .flatMap((module) => module.lessons)
      .filter((lesson) => lesson.completed).length;
    const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    if (!selectedLessonId && currentCourseState.modules[0]?.lessons[0]?.id) {
      setSelectedLessonId(currentCourseState.modules[0].lessons[0].id);
    }

    const activeLesson = currentCourseState.modules
      .flatMap((module) => module.lessons)
      .find((lesson) => lesson.id === selectedLessonId);

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
                  <YouTubeIcon className="mb-2 h-12 w-12 opacity-50" />
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
                  />
                  <label
                    htmlFor={`complete-${activeLesson.id}`}
                    className="cursor-pointer text-sm font-medium text-gray-300"
                  >
                    Marcar aula como concluída
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="flex max-h-[70vh] flex-col rounded-xl border border-brand-gray bg-brand-gray-light/30 p-4 lg:col-span-1">
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
                      <span>
                        {moduleCompleted}/{moduleTotal}
                      </span>
                    </div>
                    <ProgressBar progress={moduleProgress} />
                    <div className="mt-3 space-y-2">
                      {module.lessons.map((lesson, idx) => (
                        <div
                          key={lesson.id}
                          onClick={() => setSelectedLessonId(lesson.id)}
                          className={`group flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors ${
                            selectedLessonId === lesson.id
                              ? 'border border-brand-gold/30 bg-brand-gold/10'
                              : 'bg-brand-gray-light hover:bg-brand-gray'
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
                              aria-label={`Marcar aula '${lesson.title}' como concluída`}
                            />
                            <span
                              className={`text-sm ${
                                selectedLessonId === lesson.id
                                  ? 'font-bold text-brand-gold'
                                  : lesson.completed
                                  ? 'text-gray-500 line-through'
                                  : 'text-white'
                              }`}
                            >
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Central de Treinamentos</h2>
          <p className="mt-1 text-gray-400">Capacite-se e impulsione seus resultados.</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          <BookOpenIcon className="mx-auto h-10 w-10 text-gray-600" />
          <p className="mt-2 text-gray-400">Nenhum treinamento disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const progress = courseProgress[course.id] || 0;
            const Icon = availableIcons[course.iconName] || BookOpenIcon;

            return (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="flex h-full cursor-pointer flex-col rounded-xl border border-brand-gray bg-brand-gray-light p-6 text-left transition-colors hover:border-brand-gold/50"
              >
                <Icon className="mb-4 h-10 w-10 text-brand-gold" />
                <h3 className="h-14 text-xl font-bold text-white">{course.title}</h3>
                <p className="mt-2 h-20 overflow-hidden text-sm text-gray-400">
                  {course.description}
                </p>
                <div className="mt-auto pt-6">
                  <ProgressBar progress={progress} />
                  <p className="mt-2 text-right text-sm text-gray-400">
                    {Math.round(progress)}% Concluído
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Treinamentos;
