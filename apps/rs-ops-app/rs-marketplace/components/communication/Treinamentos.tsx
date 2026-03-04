import React, { useState, useMemo, useEffect } from 'react';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import { BuildingStorefrontIcon } from '../icons/BuildingStorefrontIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
import ContentCarousel from './ContentCarousel';
import { YouTubeIcon } from '../icons/YouTubeIcon';
import communicationAPI, { Training } from '../../services/communicationAPI';

// Helper component for progress bar
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-[#2A2A2A] h-2 rounded-full overflow-hidden">
        <div
            className="bg-yellow-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
        />
    </div>
);

// Basic types for Course structure
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

// Main component
const Treinamentos: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const availableIcons: { [key: string]: React.ElementType } = {
        IconBookOpen: BookOpenIcon,
        IconChart: ChartBarIcon,
        IconUsers: UserGroupIcon,
        IconBuilding2: BuildingStorefrontIcon
    };

    useEffect(() => {
        const loadTrainings = async () => {
            setLoading(true);
            try {
                const trainingsRes = await communicationAPI.trainings.getAll();
                if (!trainingsRes.success || !trainingsRes.data) return;
                const rawTrainings = trainingsRes.data;

                // For now, in marketplace, if we don't have user session yet, we assume progress is 0
                const fullCourses: Course[] = await Promise.all(rawTrainings.map(async (t) => {
                    const lessonsRes = await communicationAPI.trainings.getLessons(t.id);
                    const allLessons = lessonsRes.data || [];

                    const mappedLessons = allLessons
                        .map((l: any) => ({
                            id: l.id,
                            title: l.title,
                            videoId: l.video_url ? (l.video_url.includes('v=') ? l.video_url.split('v=')[1] : l.video_url.split('/').pop()) : '',
                            completed: false
                        }));

                    const modules: Module[] = [{
                        id: t.id,
                        title: 'Aulas do Treinamento',
                        lessons: mappedLessons
                    }];

                    return {
                        id: t.id,
                        title: t.title,
                        description: t.description || '',
                        iconName: (t as any).iconName || 'IconBookOpen',
                        modules
                    };
                }));

                setCourses(fullCourses);
            } catch (error) {
                console.error("Error loading trainings:", error);
            } finally {
                setLoading(false);
            }
        };
        loadTrainings();
    }, []);

    const courseProgress = useMemo(() => {
        return courses.reduce((acc, course) => {
            const lessons = course.modules.flatMap(m => m.lessons);
            const completed = lessons.filter(l => l.completed).length;
            const total = lessons.length;
            acc[course.id] = total > 0 ? (completed / total) * 100 : 0;
            return acc;
        }, {} as { [key: string]: number });
    }, [courses]);

    const handleToggleLesson = async (courseId: string, moduleId: string, lessonId: string) => {
        setCourses(prevCourses => prevCourses.map(course => {
            if (course.id !== courseId) return course;
            return {
                ...course,
                modules: course.modules.map(module => {
                    if (module.id !== moduleId) return module;
                    return {
                        ...module,
                        lessons: module.lessons.map(lesson =>
                            lesson.id === lessonId ? { ...lesson, completed: !lesson.completed } : lesson
                        )
                    };
                })
            };
        }));
    };

    if (loading) return <div className="text-center py-10 text-gray-400">Carregando treinamentos...</div>;

    if (selectedCourse) {
        const currentCourseState = courses.find(c => c.id === selectedCourse.id) || selectedCourse;
        const totalLessons = currentCourseState.modules.flatMap(m => m.lessons).length;
        const completedLessons = currentCourseState.modules.flatMap(m => m.lessons).filter(l => l.completed).length;
        const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        // Auto selection
        if (!selectedLessonId && currentCourseState.modules.length > 0 && currentCourseState.modules[0].lessons.length > 0) {
            setSelectedLessonId(currentCourseState.modules[0].lessons[0].id);
        }

        const activeLesson = currentCourseState.modules.flatMap(m => m.lessons).find(l => l.id === selectedLessonId);

        return (
            <div className="animate-fade-in space-y-6">
                <button onClick={() => { setSelectedCourse(null); setSelectedLessonId(null); }} className="text-yellow-500 font-semibold mb-4 hover:underline">&larr; Voltar para todos os cursos</button>

                <div>
                    <h2 className="text-3xl font-bold text-white">{currentCourseState.title}</h2>
                    <p className="text-gray-400 mt-1">{currentCourseState.description}</p>
                    <div className="mt-4">
                        <ProgressBar progress={overallProgress} />
                        <p className="text-sm text-gray-400 text-right mt-1">{completedLessons} de {totalLessons} aulas concluídas</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                    {/* Video Player Section */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="aspect-video bg-black rounded-xl overflow-hidden border border-[#2A2A2A]">
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
                                ></iframe>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col">
                                    <YouTubeIcon className="w-12 h-12 mb-2 opacity-50" />
                                    <p>Nenhum vídeo disponível para esta aula.</p>
                                </div>
                            )}
                        </div>
                        {activeLesson && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">{activeLesson.title}</h2>
                                <div className="flex items-center gap-2 py-4 border-t border-[#2A2A2A]">
                                    <input
                                        type="checkbox"
                                        id={`complete-${activeLesson.id}`}
                                        checked={activeLesson.completed}
                                        onChange={() => {
                                            const mod = currentCourseState.modules.find(m => m.lessons.some(l => l.id === activeLesson.id));
                                            if (mod) handleToggleLesson(currentCourseState.id, mod.id, activeLesson.id);
                                        }}
                                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                                    />
                                    <label htmlFor={`complete-${activeLesson.id}`} className="text-sm font-medium text-gray-300 cursor-pointer">
                                        Marcar aula como concluída
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Class List Section */}
                    <div className="lg:col-span-1 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-4 flex flex-col max-h-[70vh]">
                        <h3 className="text-xl font-bold text-white mb-4">Aulas do Treinamento</h3>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                            {currentCourseState.modules.map(module => {
                                const moduleTotal = module.lessons.length;
                                const moduleCompleted = module.lessons.filter(l => l.completed).length;
                                const moduleProgress = moduleTotal > 0 ? (moduleCompleted / moduleTotal) * 100 : 0;
                                return (
                                    <div key={module.id} className="space-y-3">
                                        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                                            <span className="font-bold text-gray-300">{module.title}</span>
                                            <span>{moduleCompleted}/{moduleTotal}</span>
                                        </div>
                                        <ProgressBar progress={moduleProgress} />
                                        <div className="space-y-2 mt-3">
                                            {module.lessons.map((lesson, idx) => (
                                                <div
                                                    key={lesson.id}
                                                    onClick={() => setSelectedLessonId(lesson.id)}
                                                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedLessonId === lesson.id ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-[#2A2A2A] hover:bg-gray-800'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={lesson.completed}
                                                            onChange={(e) => { e.stopPropagation(); handleToggleLesson(currentCourseState.id, module.id, lesson.id); }}
                                                            className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                                                            aria-label={`Marcar aula '${lesson.title}' como concluída`}
                                                        />
                                                        <span className={`text-sm ${selectedLessonId === lesson.id ? 'text-yellow-500 font-bold' : (lesson.completed ? 'text-gray-500 line-through' : 'text-white')}`}>
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
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Central de Treinamentos</h2>
                    <p className="text-gray-400 mt-1">Capacite-se e impulsione seus resultados.</p>
                </div>
            </div>
            {courses.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <BookOpenIcon className="w-10 h-10 mx-auto text-gray-600" />
                    <p className="mt-2 text-gray-400">Nenhum treinamento disponível no momento.</p>
                </div>
            ) : (
                <ContentCarousel
                    items={courses}
                    rows={1}
                    itemWidth="w-[280px]"
                    renderItem={(course) => {
                        const progress = courseProgress[course.id] || 0;
                        const Icon = availableIcons[course.iconName] || BookOpenIcon;
                        return (
                            <div onClick={() => setSelectedCourse(course)} className="bg-[#1E1E1E] border border-gray-800 rounded-xl cursor-pointer h-[260px] flex flex-col text-left p-0 hover:border-yellow-500/50 hover:shadow-lg transition-all duration-300 group">
                                <div className="p-6 pb-2">
                                    <Icon className="w-10 h-10 text-yellow-500 mb-4 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-xl font-bold text-white h-14 line-clamp-2 leading-tight group-hover:text-yellow-500 transition-colors">{course.title}</h3>
                                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">{course.description}</p>
                                </div>
                                <div className="mt-auto p-6 pt-0">
                                    <ProgressBar progress={progress} />
                                    <p className="text-right text-sm font-medium text-gray-400 mt-2">{Math.round(progress)}% Concluído</p>
                                </div>
                            </div>
                        )
                    }}
                />
            )}
        </div>
    );
};

export default Treinamentos;
