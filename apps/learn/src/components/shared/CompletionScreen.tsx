import { Link } from 'react-router-dom';

interface Props {
    lessonTitle: string;
    activityType: string;
    score?: number;
    totalQuestions?: number;
    pagesRead?: number;
    totalPages?: number;
    courseSlug?: string;
    nextLessonId?: number;
}

const CELEBRATIONS = ['🎉', '🌟', '🏆', '🎊', '✨', '🚀'];
const randomEmoji = CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];

export function CompletionScreen({
    lessonTitle,
    activityType,
    score,
    totalQuestions,
    pagesRead,
    totalPages,
    courseSlug,
    nextLessonId,
}: Props) {
    const isPerfect = score !== undefined && totalQuestions !== undefined && score === totalQuestions;

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 px-4">
            {/* Celebration */}
            <div className="text-8xl animate-bounce">{randomEmoji}</div>

            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-success">
                    {isPerfect ? 'Perfect Score!' : 'Amazing job!'}
                </h2>
                <p className="text-base-content/60 text-lg">You finished: <span className="font-semibold text-base-content">{lessonTitle}</span></p>
            </div>

            {/* Stats */}
            <div className="card bg-base-100 shadow-md w-full max-w-xs">
                <div className="card-body p-4 gap-2">
                    {activityType === 'quiz' && score !== undefined && totalQuestions !== undefined && (
                        <div className="text-center">
                            <p className="text-4xl font-bold text-primary">{score}/{totalQuestions}</p>
                            <p className="text-sm text-base-content/50">Questions correct</p>
                        </div>
                    )}
                    {activityType === 'story' && pagesRead !== undefined && totalPages !== undefined && (
                        <div className="text-center">
                            <p className="text-4xl font-bold text-primary">{pagesRead}/{totalPages}</p>
                            <p className="text-sm text-base-content/50">Pages read</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full max-w-xs">
                {nextLessonId && (
                    <Link to={`/lessons/${nextLessonId}`} className="btn btn-primary btn-lg w-full">
                        Next Lesson →
                    </Link>
                )}
                {courseSlug && (
                    <Link to={`/courses/${courseSlug}`} className="btn btn-outline w-full">
                        Back to Course
                    </Link>
                )}
                <Link to="/courses" className="btn btn-ghost btn-sm">
                    All Courses
                </Link>
            </div>
        </div>
    );
}
