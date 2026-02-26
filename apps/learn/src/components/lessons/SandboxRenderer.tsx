import { useState, useCallback } from 'react';
import { useSession } from '../../hooks/useSession';
import type { SandboxContent, SandboxItem, AgeHints } from '@kidspark/shared';
import { CharacterBubble } from '../shared/CharacterBubble';
import { ProgressBar } from '../shared/ProgressBar';
import { saveProgress } from '../../lib/progress';

interface Props {
    lessonId: number;
    content: SandboxContent;
    onComplete: (data: Record<string, unknown>) => void;
}

function getAgeRange(age: number): keyof AgeHints {
    if (age <= 5) return '3-5';
    if (age <= 8) return '6-8';
    return '9-12';
}

export function SandboxRenderer({ lessonId, content, onComplete }: Props) {
    const { kid } = useSession();
    const ageRange = getAgeRange(kid?.age ?? 7);
    const hint = content.hints?.[ageRange];

    // Track: which item is selected and where items are placed
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [placements, setPlacements] = useState<Record<string, string>>({}); // itemId → zoneId
    const [feedback, setFeedback] = useState<{ itemId: string; correct: boolean } | null>(null);

    const placedCount = Object.keys(placements).length;
    const totalItems = content.items.length;

    const handleItemTap = useCallback((item: SandboxItem) => {
        if (placements[item.id]) return; // already placed
        setSelectedItemId(item.id === selectedItemId ? null : item.id);
        setFeedback(null);
    }, [selectedItemId, placements]);

    const handleZoneTap = useCallback((zoneId: string) => {
        if (!selectedItemId) return;
        const item = content.items.find((i) => i.id === selectedItemId);
        if (!item) return;

        const correctZone = item.correct_zone_id ?? (item as unknown as Record<string, unknown>)['correct_zone'] as string;
        const isCorrect = correctZone === zoneId;
        if (isCorrect) {
            setPlacements((p) => ({ ...p, [selectedItemId]: zoneId }));
            setFeedback({ itemId: selectedItemId, correct: true });
            setSelectedItemId(null);

            saveProgress(lessonId, {
                status: 'in_progress',
                answers_json: JSON.stringify({ placed: placedCount + 1, total: totalItems }),
            });
        } else {
            setFeedback({ itemId: selectedItemId, correct: false });
        }
    }, [selectedItemId, content.items, placedCount, totalItems, lessonId]);

    const allPlaced = placedCount === totalItems;

    return (
        <div className="flex flex-col gap-4 max-w-lg mx-auto">
            {/* Progress */}
            <ProgressBar current={placedCount} total={totalItems} label={`${placedCount} of ${totalItems} placed`} />

            {/* Character hint */}
            {content.character && hint && (
                <CharacterBubble
                    name={content.character.name}
                    avatarKey={content.character.avatar_key}
                    text={hint}
                />
            )}

            {/* Instruction */}
            <p className="text-sm text-base-content/60 text-center">
                Tap an item, then tap where it belongs!
            </p>

            {/* Items to place */}
            <div>
                <p className="text-xs font-semibold text-base-content/50 mb-2 uppercase tracking-wider">Items</p>
                <div className="flex flex-wrap gap-2">
                    {content.items.map((item) => {
                        const placed = !!placements[item.id];
                        const isSelected = item.id === selectedItemId;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleItemTap(item)}
                                disabled={placed}
                                className={`btn btn-sm transition-all ${placed
                                    ? 'btn-success opacity-50 cursor-not-allowed'
                                    : isSelected
                                        ? 'btn-primary shadow-lg scale-105'
                                        : 'btn-outline'
                                    }`}
                            >
                                {item.label}
                                {placed && ' ✓'}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Drop zones */}
            {content.zones && content.zones.length > 0 && (
                <div>
                    <p className="text-xs font-semibold text-base-content/50 mb-2 uppercase tracking-wider">Drop Zones</p>
                    <div className="grid grid-cols-2 gap-3">
                        {content.zones.map((zone) => {
                            const itemsPlacedHere = content.items.filter((i) => placements[i.id] === zone.id);
                            return (
                                <button
                                    key={zone.id}
                                    onClick={() => selectedItemId && handleZoneTap(zone.id)}
                                    className={`min-h-16 rounded-xl border-2 border-dashed p-3 text-center transition-all ${selectedItemId
                                        ? 'border-primary bg-primary/5 cursor-pointer hover:bg-primary/10'
                                        : 'border-base-300 cursor-default'
                                        }`}
                                >
                                    <p className="font-semibold text-sm">{zone.label}</p>
                                    <div className="flex flex-wrap gap-1 mt-1 justify-center">
                                        {itemsPlacedHere.map((i) => (
                                            <span key={i.id} className="badge badge-success badge-xs">{i.label}</span>
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Feedback */}
            {feedback && !feedback.correct && (
                <div className="alert alert-warning py-2">
                    <span>Not quite! Try a different spot 🤔</span>
                </div>
            )}
            {feedback && feedback.correct && (
                <div className="alert alert-success py-2">
                    <span>Great placement! 🎯</span>
                </div>
            )}

            {/* Finish */}
            {allPlaced && (
                <button className="btn btn-success btn-lg w-full" onClick={() => onComplete({})}>
                    All done! 🎉
                </button>
            )}
        </div>
    );
}
