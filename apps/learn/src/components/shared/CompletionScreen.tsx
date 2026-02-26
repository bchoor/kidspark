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

const CELEBRATIONS = ['🎉', '🌟', '🏆', '🎊', '✨', '🚀', '🦄', '💫'];
const randomEmoji = () => CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];

// Mini confetti pieces rendered as CSS
const CONFETTI_COLORS = ['#F59E0B', '#F97316', '#14B8A6', '#8B5CF6', '#EC4899', '#10B981'];

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
    const emoji = randomEmoji();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 px-4 relative overflow-hidden">
            {/* Confetti dots */}
            {CONFETTI_COLORS.map((color, i) => (
                <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full pointer-events-none"
                    style={{
                        background: color,
                        left: `${10 + i * 15}%`,
                        top: '-10px',
                        animation: `confetti-fall ${1.2 + i * 0.2}s ease-in ${i * 0.1}s forwards`,
                        opacity: 0.9,
                    }}
                />
            ))}
            {CONFETTI_COLORS.map((color, i) => (
                <div
                    key={`b${i}`}
                    className="absolute w-2 h-2 rounded-sm pointer-events-none"
                    style={{
                        background: color,
                        left: `${20 + i * 12}%`,
                        top: '-10px',
                        animation: `confetti-fall ${1.5 + i * 0.15}s ease-in ${0.3 + i * 0.1}s forwards`,
                        opacity: 0.8,
                    }}
                />
            ))}

            {/* Big celebration emoji */}
            <div className="text-8xl animate-bounce-in">{emoji}</div>

            <div className="space-y-2 animate-fade-up">
                <h2 className="text-4xl font-bold font-display text-success">
                    {isPerfect ? 'Perfect!' : 'Amazing!'}
                </h2>
                <p className="text-base-content/60 text-lg font-medium">
                    You finished: <span className="font-bold text-base-content">{lessonTitle}</span>
                </p>
            </div>

            {/* Stats card */}
            {((activityType === 'quiz' && score !== undefined && totalQuestions !== undefined) ||
                (activityType === 'story' && pagesRead !== undefined && totalPages !== undefined)) && (
                    <div className="card bg-base-100 shadow-xl border border-base-300 w-full max-w-xs animate-pop-in">
                        <div className="card-body p-6 items-center gap-1">
                            {activityType === 'quiz' && score !== undefined && totalQuestions !== undefined && (
                                <>
                                    <p className="text-5xl font-bold font-display text-primary">{score}<span className="text-2xl text-base-content/40">/{totalQuestions}</span></p>
                                    <p className="text-sm text-base-content/50 font-medium">Questions correct</p>
                                    {isPerfect && <div className="badge badge-success badge-md mt-1 font-semibold">Perfect score! 🌟</div>}
                                </>
                            )}
                            {activityType === 'story' && pagesRead !== undefined && totalPages !== undefined && (
                                <>
                                    <p className="text-5xl font-bold font-display text-primary">{pagesRead}<span className="text-2xl text-base-content/40">/{totalPages}</span></p>
                                    <p className="text-sm text-base-content/50 font-medium">Pages read</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full max-w-xs animate-fade-up delay-2">
                {nextLessonId && (
                    <Link to={`/lessons/${nextLessonId}`} className="btn btn-primary btn-lg w-full font-display font-bold">
                        Next Lesson →
                    </Link>
                )}
                {courseSlug && (
                    <Link to={`/courses/${courseSlug}`} className="btn btn-outline w-full font-semibold">
                        Back to Course
                    </Link>
                )}
                <Link to="/courses" className="btn btn-ghost btn-sm text-base-content/50">
                    All Courses
                </Link>
            </div>
        </div>
    );
}
