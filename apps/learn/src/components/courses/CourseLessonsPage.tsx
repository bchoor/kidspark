import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useProgress } from '../../hooks/useProgress';
import type { Course, Lesson } from '@kidspark/shared';

const ACTIVITY_ICONS: Record<string, string> = {
    story: '📖',
    quiz: '❓',
    sandbox: '🧩',
    mixed: '🎯',
};

const PROGRESS_STATUS: Record<string, { label: string; badge: string }> = {
    not_started: { label: 'Not started', badge: 'badge-ghost' },
    in_progress: { label: 'In progress', badge: 'badge-warning' },
    completed: { label: 'Done! ✓', badge: 'badge-success' },
};

export function CourseLessonsPage() {
    const { slug } = useParams<{ slug: string }>();
    const [data, setData] = useState<{ course: Course; lessons: Lesson[] } | null>(null);
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
                <span className="loading loading-spinner loading-lg text-primary" />
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

    const { course, lessons } = data;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Back link */}
            <Link to="/courses" className="btn btn-ghost btn-sm gap-1">
                ← All Courses
            </Link>

            {/* Course header */}
            <div className="card bg-base-100 shadow overflow-hidden">
                {course.cover_image_key ? (
                    <figure className="aspect-video overflow-hidden">
                        <img src={api.media.url(course.cover_image_key)} alt={course.title} className="w-full h-full object-cover" />
                    </figure>
                ) : (
                    <div className="aspect-video bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                        <span className="text-6xl">📚</span>
                    </div>
                )}
                <div className="card-body p-4">
                    <h1 className="text-2xl font-bold">{course.title}</h1>
                    {course.description && <p className="text-base-content/60">{course.description}</p>}
                    <p className="text-sm text-base-content/40">{lessons.length} lessons</p>
                </div>
            </div>

            {/* Lesson list */}
            <div className="space-y-3">
                <h2 className="font-bold text-lg">Lessons</h2>
                {lessons.length === 0 && (
                    <p className="text-base-content/50 text-center py-8">No lessons yet — check back soon!</p>
                )}
                {lessons.map((lesson, idx) => {
                    const progress = getProgress(lesson.id);
                    const statusKey = progress?.status ?? 'not_started';
                    const status = PROGRESS_STATUS[statusKey] ?? PROGRESS_STATUS['not_started'];
                    const isCompleted = statusKey === 'completed';

                    return (
                        <Link
                            key={lesson.id}
                            to={`/lessons/${lesson.id}`}
                            className={`card bg-base-100 shadow hover:shadow-md transition-all border-2 ${isCompleted ? 'border-success/30' : 'border-transparent hover:border-primary/50'}`}
                        >
                            <div className="card-body p-4 flex-row items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${isCompleted ? 'bg-success/20 text-success' : 'bg-base-200'}`}>
                                    {isCompleted ? '✓' : ACTIVITY_ICONS[lesson.activity_type] ?? '📖'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">
                                        {idx + 1}. {lesson.title}
                                    </p>
                                    <p className="text-xs text-base-content/50 capitalize">{lesson.activity_type}</p>
                                </div>
                                <span className={`badge badge-sm ${status.badge} flex-shrink-0`}>
                                    {status.label}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
