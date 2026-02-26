import { useState, useCallback } from 'react';
import { useSession } from '../../hooks/useSession';
import type { QuizContent, QuizQuestion, AgeHints } from '@kidspark/shared';
import { CharacterBubble } from '../shared/CharacterBubble';
import { ProgressBar } from '../shared/ProgressBar';
import { saveProgress } from '../../lib/progress';

interface Props {
    lessonId: number;
    content: QuizContent;
    onComplete: (data: { score: number; totalQuestions: number }) => void;
}

function getAgeRange(age: number): keyof AgeHints {
    if (age <= 5) return '3-5';
    if (age <= 8) return '6-8';
    return '9-12';
}

type AnswerState = 'unanswered' | 'correct' | 'wrong';

export function QuizRenderer({ lessonId, content, onComplete }: Props) {
    const { kid } = useSession();
    const ageRange = getAgeRange(kid?.age ?? 7);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
    const [score, setScore] = useState(0);

    const questions = content.questions;
    const question: QuizQuestion | undefined = questions[currentIdx];
    const isLast = currentIdx === questions.length - 1;
    const hint = question?.hints?.[ageRange];

    const handleConfirm = useCallback(() => {
        if (!selected || !question) return;
        const isCorrect = selected === question.correct_answer;
        setAnswerState(isCorrect ? 'correct' : 'wrong');
        if (isCorrect) setScore((s) => s + 1);

        saveProgress(lessonId, {
            status: 'in_progress',
            answers_json: JSON.stringify({ current_question: currentIdx + 1, total: questions.length }),
        });
    }, [selected, question, currentIdx, questions.length, lessonId]);

    const handleNext = useCallback(() => {
        if (isLast) {
            const finalScore = score + (answerState === 'correct' ? 0 : 0); // score already updated
            onComplete({ score, totalQuestions: questions.length });
        } else {
            setCurrentIdx((i) => i + 1);
            setSelected(null);
            setAnswerState('unanswered');
        }
    }, [isLast, score, answerState, onComplete, questions.length]);

    if (!question) return null;

    return (
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
            {/* Progress */}
            <ProgressBar
                current={currentIdx + 1}
                total={questions.length}
                label={`Question ${currentIdx + 1} of ${questions.length}`}
            />

            {/* Character */}
            {content.character && (
                <CharacterBubble
                    name={content.character.name}
                    avatarKey={content.character.avatar_key}
                    text={question.question}
                />
            )}

            {/* Options */}
            <div className="space-y-3">
                {question.options.map((opt) => {
                    let btnClass = 'btn btn-outline w-full text-left justify-start h-auto py-3 px-4 normal-case';
                    if (answerState !== 'unanswered') {
                        if (opt.id === question.correct_answer) {
                            btnClass += ' btn-success';
                        } else if (opt.id === selected && answerState === 'wrong') {
                            btnClass += ' btn-error';
                        } else {
                            btnClass += ' opacity-50';
                        }
                    } else if (opt.id === selected) {
                        btnClass += ' btn-primary';
                    }

                    return (
                        <button
                            key={opt.id}
                            className={btnClass}
                            onClick={() => answerState === 'unanswered' && setSelected(opt.id)}
                            disabled={answerState !== 'unanswered'}
                        >
                            {opt.text}
                        </button>
                    );
                })}
            </div>

            {/* Feedback */}
            {answerState === 'correct' && (
                <div className="alert alert-success animate-in fade-in">
                    <span>🎉 Correct! {question.explanation}</span>
                </div>
            )}
            {answerState === 'wrong' && (
                <div className="alert alert-error animate-in fade-in">
                    <span>Try again! {hint ? `Hint: ${hint}` : question.explanation}</span>
                </div>
            )}

            {/* Actions */}
            {answerState === 'unanswered' ? (
                <button
                    className="btn btn-primary w-full"
                    onClick={handleConfirm}
                    disabled={!selected}
                >
                    Check Answer ✓
                </button>
            ) : (
                <button className="btn btn-primary w-full" onClick={handleNext}>
                    {isLast ? 'See Results 🏆' : 'Next Question →'}
                </button>
            )}

            {/* Score tracker */}
            <p className="text-center text-sm text-base-content/50">
                Score: {score}/{currentIdx + (answerState !== 'unanswered' ? 1 : 0)}
            </p>
        </div>
    );
}
