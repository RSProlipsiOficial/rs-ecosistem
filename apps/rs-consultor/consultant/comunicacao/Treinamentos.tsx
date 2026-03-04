
import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../components/Card';
import {
    IconChart,
    IconUsers,
    IconBuilding2,
    IconBookOpen,
    IconYoutube,
} from '../../components/icons';
// import { mockCourses as initialCourses } from '../data'; // Removed
import type { Course, Module, Lesson } from '../../types';
import { communicationService } from '../services/communicationService';
import { useUser } from '../ConsultantLayout';

// Helper component for progress bar
const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-brand-gray h-2 rounded-full overflow-hidden">
        <div
            className="bg-brand-gold h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
        />
    </div>
);

// Main component
const Treinamentos: React.FC = () => {
    const { user } = useUser();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const availableIcons: { [key: string]: React.ElementType } = { IconBookOpen, IconChart, IconUsers, IconBuilding2 };

    useEffect(() => {
        const loadTrainings = async () => {
            if (!user) return;
            setLoading(true);
            try {
                // 1. Fetch Trainings (These are now "Modules" from DB)
                const trainingsRes = await communicationService.getTrainings();
                if (!trainingsRes.success || !trainingsRes.data) return;
                const rawTrainings = trainingsRes.data;

                // 2. Fetch Progress
                const progressRes = await communicationService.getTrainingProgress(user.id);
                const completedLessonIds = new Set(progressRes.data?.map((p: any) => p.lesson_id));

                // 3. Build structure
                const fullCourses: Course[] = await Promise.all(rawTrainings.map(async (t) => {
                    // Start fetching lessons directly for this training (module)
                    const lessonsRes = await communicationService.getLessons(t.id);
                    const allLessons = lessonsRes.data || [];

                    // Map lessons
                    const mappedLessons = allLessons
                        .map((l: any) => ({
                            id: l.id,
                            title: l.title,
                            videoId: l.video_url ? (l.video_url.includes('v=') ? l.video_url.split('v=')[1] : l.video_url.split('/').pop()) : '',
                            completed: completedLessonIds.has(l.id)
                        }))
                        .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));

                    // Wrap in a single module for UI compatibility (Course -> Module -> Lessons)
                    const modules: Module[] = [{
                        id: t.id, // Use training ID as module ID
                        title: 'Aulas do Treinamento', // Generic title or reuse training title
                        lessons: mappedLessons
                    }];

                    return {
                        id: t.id,
                        title: t.title,
                        description: t.description || '',
                        iconName: t.iconName || 'IconBookOpen',
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
    }, [user]);

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
        // Optimistic update
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

        // Call API
        if (user) {
            await communicationService.completeLesson(lessonId, user.id, courseId); // Note: Toggle logic usually just marks complete. If uncheck is allowed, API needs support. Assuming complete for now.
        }
    };

    if (loading) return <div className="text-center py-10 text-gray-400">Carregando treinamentos...</div>;

    if (selectedCourse) {
        // Find current state to reflect updates
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
                <button onClick={() => { setSelectedCourse(null); setSelectedLessonId(null); }} className="text-brand-gold font-semibold mb-4 hover:underline">&larr; Voltar para todos os cursos</button>

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
                        <div className="aspect-video bg-black rounded-xl overflow-hidden border border-brand-gray">
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
                                    <IconYoutube className="w-12 h-12 mb-2 opacity-50" />
                                    <p>Nenhum vídeo disponível para esta aula.</p>
                                </div>
                            )}
                        </div>
                        {activeLesson && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">{activeLesson.title}</h2>
                                <div className="flex items-center gap-2 py-4 border-t border-brand-gray">
                                    <input
                                        type="checkbox"
                                        id={`complete-${activeLesson.id}`}
                                        checked={activeLesson.completed}
                                        onChange={() => {
                                            const mod = currentCourseState.modules.find(m => m.lessons.some(l => l.id === activeLesson.id));
                                            if (mod) handleToggleLesson(currentCourseState.id, mod.id, activeLesson.id);
                                        }}
                                        className="h-5 w-5 rounded bg-brand-gray border-brand-gray-light text-brand-gold focus:ring-brand-gold cursor-pointer"
                                    />
                                    <label htmlFor={`complete-${activeLesson.id}`} className="text-sm font-medium text-gray-300 cursor-pointer">
                                        Marcar aula como concluída
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Class List Section */}
                    <div className="lg:col-span-1 bg-brand-gray-light/30 border border-brand-gray rounded-xl p-4 flex flex-col max-h-[70vh]">
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
                                                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedLessonId === lesson.id ? 'bg-brand-gold/10 border border-brand-gold/30' : 'bg-brand-gray-light hover:bg-brand-gray'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={lesson.completed}
                                                            onChange={(e) => { e.stopPropagation(); handleToggleLesson(currentCourseState.id, module.id, lesson.id); }}
                                                            className="h-4 w-4 rounded bg-brand-gray border-brand-gray-light text-brand-gold focus:ring-brand-gold cursor-pointer"
                                                            aria-label={`Marcar aula '${lesson.title}' como concluída`}
                                                        />
                                                        <span className={`text-sm ${selectedLessonId === lesson.id ? 'text-brand-gold font-bold' : (lesson.completed ? 'text-gray-500 line-through' : 'text-white')}`}>
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
                    <IconBookOpen size={40} className="mx-auto" />
                    <p className="mt-2 text-gray-400">Nenhum treinamento disponível no momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => {
                        const progress = courseProgress[course.id] || 0;
                        const Icon = availableIcons[course.iconName] || IconBookOpen;
                        return (
                            <div key={course.id} onClick={() => setSelectedCourse(course)}>
                                <Card className="cursor-pointer h-full flex flex-col text-left p-0 bg-brand-gray-light hover:border-brand-gold/50 transition-colors">
                                    <div className="p-6">
                                        <Icon size={40} className="text-brand-gold mb-4" />
                                        <h3 className="text-xl font-bold text-white h-14">{course.title}</h3>
                                        <p className="text-sm text-gray-400 mt-2 h-20 overflow-hidden">{course.description}</p>
                                    </div>
                                    <div className="mt-auto p-6">
                                        <ProgressBar progress={progress} />
                                        <p className="text-right text-sm text-gray-400 mt-2">{Math.round(progress)}% Concluído</p>
                                    </div>
                                </Card>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default Treinamentos;
