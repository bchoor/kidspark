import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useProgress } from '../../hooks/useProgress';
import type { Course, Lesson } from '@kidspark/shared';

const ACTIVITY_ICONS: Record<string, string> = {
    story: '📖',
    quiz: '🧠',
    sandbox: '🧩',
    mixed: '🎯',
};

const ACTIVITY_COLORS: Record<string, string> = {
    story: 'from-amber-400 to-orange-400',
    quiz: 'from-violet-400 to-purple-400',
    sandbox: 'from-teal-400 to-cyan-400',
    mixed: 'from-rose-400 to-pink-400',
};

const STATUS_STYLES: Record<string, { badge: string; ring: string; icon: string }> = {
    not_started: { badge: 'badge-ghost', ring: 'border-transparent', icon: '' },
    in_progress: { badge: 'badge-warning', ring: 'border-warning/40', icon: '▶' },
    completed: { badge: 'badge-success', ring: 'border-success/40', icon: '✓' },
};

export function CourseLessonsPage() {
    const { slug } = useParams<{ slug: string }>();
    const [data, setData] = useState<(Course & { lessons: Lesson[] }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getProgress } = useProgress();

    useEffect(() => {
        if (!slug) return;
        api.courses.get(slug)
            .then(setData)
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <span className="loading loading-dots loading-lg text-primary" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="max-w-md mx-auto mt-10 space-y-3">
                <div className="alert alert-error"><span>{error ?? 'Course not found'}</span></div>
                <Link to="/courses" className="btn btn-ghost btn-sm">← Back to courses</Link>
            </div>
        );
    }

    const course = data;
    const { lessons } = data;
    const completedCount = lessons.filter(l => getProgress(l.id)?.status === 'completed').length;
    const pct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Back */}
            <Link to="/courses" className="btn btn-ghost btn-sm gap-1 animate-fade-up -ml-2">
                ← All Courses
            </Link>

            {/* Course hero */}
            <div className="card bg-base-100 shadow-xl overflow-hidden animate-bounce-in border border-base-300">
                {course.cover_image_key ? (
                    <figure className="aspect-video overflow-hidden">
                        <img src={api.media.url(course.cover_image_key)} alt={course.title} className="w-full h-full object-cover" />
                    </figure>
                ) : (
                    <div className={`aspect-video bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center`}>
                        <span className="text-8xl animate-float inline-block">🦕</span>
                    </div>
                )}
                <div className="card-body p-5 gap-3">
                    <h1 className="text-2xl font-bold font-display">{course.title}</h1>
                    {course.description && <p className="text-base-content/60 font-medium">{course.description}</p>}

                    {/* Progress bar */}
                    {lessons.length > 0 && (
                        <div className="space-y-1.5 mt-1">
                            <div className="flex justify-between text-xs font-semibold text-base-content/50">
                                <span>{completedCount} of {lessons.length} lessons done</span>
                                <span>{pct}%</span>
                            </div>
                            <div className="w-full bg-base-300 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-3 rounded-full transition-all duration-700 ease-out progress-shimmer"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Lesson list */}
            <div className="space-y-3">
                <h2 className="font-bold text-lg font-display">Lessons</h2>
                {lessons.length === 0 && (
                    <p className="text-base-content/50 text-center py-8 font-medium">No lessons yet — check back soon! 🌟</p>
                )}
                {lessons.map((lesson, idx) => {
                    const progress = getProgress(lesson.id);
                    const statusKey = progress?.status ?? 'not_started';
                    const style = STATUS_STYLES[statusKey] ?? STATUS_STYLES['not_started'];
                    const isCompleted = statusKey === 'completed';
                    const gradClass = ACTIVITY_COLORS[lesson.activity_type] ?? 'from-base-300 to-base-200';

                    return (
                        <Link
                            key={lesson.id}
                            to={`/lessons/${lesson.id}`}
                            className={`card bg-base-100 shadow hover:shadow-lg transition-all border-2 hover:-translate-y-0.5
                                        animate-fade-up delay-${Math.min(idx + 1, 6)} ${style.ring} border-2`}
                        >
                            <div className="card-body p-4 flex-row items-center gap-4">
                                {/* Number / icon badge */}
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradClass} flex items-center justify-center text-xl flex-shrink-0 shadow-sm`}>
                                    {isCompleted ? '✓' : ACTIVITY_ICONS[lesson.activity_type] ?? '📖'}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-bold font-display truncate">
                                        {idx + 1}. {lesson.title}
                                    </p>
                                    <p className="text-xs text-base-content/50 capitalize font-medium">{lesson.activity_type} activity</p>
                                </div>

                                <span className={`badge ${style.badge} badge-sm font-semibold flex-shrink-0`}>
                                    {statusKey === 'completed' ? 'Done ✓' : statusKey === 'in_progress' ? 'In progress' : 'Start →'}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
