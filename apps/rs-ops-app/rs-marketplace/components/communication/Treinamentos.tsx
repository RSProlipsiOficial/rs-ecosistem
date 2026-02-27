
import React, { useState, useMemo, useEffect } from 'react';
import { ChartBarIcon } from '../icons/ChartBarIcon';
import { UserGroupIcon } from '../icons/UserGroupIcon';
import { BuildingStorefrontIcon } from '../icons/BuildingStorefrontIcon';
import { BookOpenIcon } from '../icons/BookOpenIcon';
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

        return (
            <div className="animate-fade-in space-y-6">
                <button onClick={() => setSelectedCourse(null)} className="text-yellow-500 font-semibold mb-4">&larr; Voltar para todos os cursos</button>
                <div>
                    <h2 className="text-3xl font-bold text-white">{currentCourseState.title}</h2>
                    <p className="text-gray-400 mt-1">{currentCourseState.description}</p>
                    <div className="mt-4">
                        <ProgressBar progress={overallProgress} />
                        <p className="text-sm text-gray-400 text-right mt-1">{completedLessons} de {totalLessons} aulas concluídas</p>
                    </div>
                </div>
                <div className="space-y-6">
                    {currentCourseState.modules.map(module => {
                        const moduleTotal = module.lessons.length;
                        const moduleCompleted = module.lessons.filter(l => l.completed).length;
                        const moduleProgress = moduleTotal > 0 ? (moduleCompleted / moduleTotal) * 100 : 0;
                        return (
                            <div key={module.id} className="bg-[#1E1E1E] border border-gray-800 p-6 rounded-xl">
                                <h3 className="text-xl font-bold text-white mb-2">{module.title}</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <ProgressBar progress={moduleProgress} />
                                    <span className="text-sm text-gray-400 whitespace-nowrap">{moduleCompleted}/{moduleTotal}</span>
                                </div>
                                <div className="space-y-3">
                                    {module.lessons.map(lesson => (
                                        <div key={lesson.id} className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={lesson.completed}
                                                    onChange={() => handleToggleLesson(currentCourseState.id, module.id, lesson.id)}
                                                    className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-yellow-500 focus:ring-yellow-500 mr-3 cursor-pointer"
                                                />
                                                <span className={`text-sm ${lesson.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{lesson.title}</span>
                                            </div>
                                            {lesson.videoId && (
                                                <a href={`https://www.youtube.com/watch?v=${lesson.videoId}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-sm bg-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors font-semibold">
                                                    <YouTubeIcon className="w-4 h-4 text-red-500" />
                                                    <span>Assistir</span>
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => {
                        const progress = courseProgress[course.id] || 0;
                        const Icon = availableIcons[course.iconName] || BookOpenIcon;
                        return (
                            <div key={course.id} onClick={() => setSelectedCourse(course)} className="bg-[#1E1E1E] border border-gray-800 rounded-xl cursor-pointer h-full flex flex-col text-left p-0 bg-brand-gray-light hover:border-yellow-500/50 transition-colors">
                                <div className="p-6">
                                    <Icon className="w-10 h-10 text-yellow-500 mb-4" />
                                    <h3 className="text-xl font-bold text-white h-14">{course.title}</h3>
                                    <p className="text-sm text-gray-400 mt-2 h-20 overflow-hidden">{course.description}</p>
                                </div>
                                <div className="mt-auto p-6">
                                    <ProgressBar progress={progress} />
                                    <p className="text-right text-sm text-gray-400 mt-2">{Math.round(progress)}% Concluído</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default Treinamentos;
