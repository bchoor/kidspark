import { useState, useEffect, useCallback } from 'react';
import { useSession } from '../../hooks/useSession';
import type { StoryContent, StoryPage, AgeVariants } from '@kidspark/shared';
import { CharacterBubble } from '../shared/CharacterBubble';
import { ProgressBar } from '../shared/ProgressBar';
import { api } from '../../lib/api';
import { saveProgress } from '../../lib/progress';

interface Props {
    lessonId: number;
    content: StoryContent;
    onComplete: (data: { pagesRead: number; totalPages: number }) => void;
}

function getAgeRange(age: number): keyof AgeVariants {
    if (age <= 5) return '3-5';
    if (age <= 8) return '6-8';
    return '9-12';
}

function getNarration(page: StoryPage, ageRange: keyof AgeVariants): string {
    return page.age_variants?.[ageRange]?.narration || page.narration;
}

export function StoryRenderer({ lessonId, content, onComplete }: Props) {
    const { kid } = useSession();
    const ageRange = getAgeRange(kid?.age ?? 7);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [animating, setAnimating] = useState(false);

    const pages = content.pages;
    const page = pages[currentIdx];
    const isLast = currentIdx === pages.length - 1;

    // Save progress on page change
    useEffect(() => {
        saveProgress(lessonId, {
            status: 'in_progress',
            answers_json: JSON.stringify({ current_page: currentIdx + 1, total_pages: pages.length }),
        });
    }, [currentIdx, lessonId, pages.length]);

    const goNext = useCallback(() => {
        if (animating) return;
        if (isLast) {
            onComplete({ pagesRead: pages.length, totalPages: pages.length });
            return;
        }
        setAnimating(true);
        setTimeout(() => {
            setCurrentIdx((i) => i + 1);
            setAnimating(false);
        }, 200);
    }, [animating, isLast, onComplete, pages.length]);

    const goPrev = useCallback(() => {
        if (animating || currentIdx === 0) return;
        setAnimating(true);
        setTimeout(() => {
            setCurrentIdx((i) => i - 1);
            setAnimating(false);
        }, 200);
    }, [animating, currentIdx]);

    if (!page) return null;

    const narration = getNarration(page, ageRange);

    return (
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
            {/* Progress */}
            <ProgressBar current={currentIdx + 1} total={pages.length} label={`Page ${currentIdx + 1} of ${pages.length}`} />

            {/* Image */}
            {page.image_key && (
                <div className="rounded-2xl overflow-hidden shadow aspect-video">
                    <img
                        src={api.media.url(page.image_key)}
                        alt="Story illustration"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {/* Narration card */}
            <div
                className={`card bg-base-100 shadow-md transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}
            >
                <div className="card-body p-5 gap-4">
                    <p className="text-lg leading-relaxed">{narration}</p>

                    {/* Character dialogue */}
                    {page.character_dialogue && content.character && (
                        <CharacterBubble
                            name={content.character.name}
                            avatarKey={content.character.avatar_key}
                            text={page.character_dialogue}
                        />
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
                <button
                    onClick={goPrev}
                    disabled={currentIdx === 0}
                    className="btn btn-outline flex-1"
                >
                    ← Back
                </button>
                <button
                    onClick={goNext}
                    className="btn btn-primary flex-1"
                >
                    {isLast ? 'Finish! 🎉' : 'Next →'}
                </button>
            </div>
        </div>
    );
}
