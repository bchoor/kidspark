import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { saveProgress, flushProgress } from '../../lib/progress';
import { useSession } from '../../hooks/useSession';
import { StoryRenderer } from './StoryRenderer';
import { QuizRenderer } from './QuizRenderer';
import { SandboxRenderer } from './SandboxRenderer';
import { CompletionScreen } from '../shared/CompletionScreen';
import type { Lesson, LessonContent, StoryContent, QuizContent, SandboxContent } from '@kidspark/shared';

export function LessonViewer() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { kid } = useSession();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [content, setContent] = useState<LessonContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completed, setCompleted] = useState(false);
    const [completionData, setCompletionData] = useState<Record<string, unknown>>({});

    const lessonId = Number(id);

    useEffect(() => {
        if (!lessonId) return;

        // Reset state on new lesson
        setCompleted(false);
        setCompletionData({});
        setLesson(null);
        setContent(null);
        setError(null);
        setLoading(true);

        api.lessons.get(lessonId)
            .then((l) => {
                setLesson(l);
                try { setContent(JSON.parse(l.content_json)); } catch { /* null content */ }
            })
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));

        // Flush any pending progress when leaving
        return () => { flushProgress(lessonId); };
    }, [lessonId]);

    const handleComplete = useCallback((data: Record<string, unknown>) => {
        setCompletionData(data);
        setCompleted(true);
        // Save completion immediately
        saveProgress(lessonId, {
            status: 'completed',
            completed_at: new Date().toISOString(),
            answers_json: JSON.stringify(data),
            ...(typeof data.score === 'number' ? { score: data.score } : {}),
        });
        flushProgress(lessonId);
    }, [lessonId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="max-w-md mx-auto mt-10 space-y-3">
                <div className="alert alert-error"><span>{error ?? 'Lesson not found'}</span></div>
                <Link to="/courses" className="btn btn-ghost btn-sm">← Back to courses</Link>
            </div>
        );
    }

    if (completed) {
        return (
            <CompletionScreen
                lessonTitle={lesson.title}
                activityType={lesson.activity_type}
                score={typeof completionData.score === 'number' ? completionData.score : undefined}
                totalQuestions={typeof completionData.totalQuestions === 'number' ? completionData.totalQuestions : undefined}
                pagesRead={typeof completionData.pagesRead === 'number' ? completionData.pagesRead : undefined}
                totalPages={typeof completionData.totalPages === 'number' ? completionData.totalPages : undefined}
                courseSlug={lesson.course_slug}
                nextLessonId={lesson.next_lesson_id}
            />
        );
    }

    return (
        <div className="max-w-lg mx-auto space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm btn-square">←</button>
                <div className="flex-1 min-w-0">
                    <h1 className="font-bold text-lg truncate">{lesson.title}</h1>
                    <p className="text-sm text-base-content/50 capitalize">{lesson.activity_type} activity</p>
                </div>
                {kid && (
                    <span className="text-xl">{kid.avatar ?? '🦁'}</span>
                )}
            </div>

            {/* Renderer */}
            {(!content || !content.type) ? (
                <div className="card bg-base-100 shadow-sm p-12 text-center border border-base-300 mt-4">
                    <span className="text-6xl mb-4 inline-block animate-bounce-in">🚧</span>
                    <h2 className="text-2xl font-bold font-display text-base-content mb-2 animate-fade-up">This lesson is empty!</h2>
                    <p className="text-base-content/60 font-medium text-lg leading-relaxed animate-fade-up delay-1">
                        We're still building this adventure. Check back later to see what happens next!
                    </p>
                </div>
            ) : (
                <>
                    {content.type === 'story' && (
                        <StoryRenderer lessonId={lessonId} content={content as StoryContent} onComplete={handleComplete} />
                    )}
                    {content.type === 'quiz' && (
                        <QuizRenderer lessonId={lessonId} content={content as QuizContent} onComplete={handleComplete} />
                    )}
                    {content.type === 'sandbox' && (
                        <SandboxRenderer lessonId={lessonId} content={content as SandboxContent} onComplete={handleComplete} />
                    )}
                </>
            )}
        </div>
    );
}
