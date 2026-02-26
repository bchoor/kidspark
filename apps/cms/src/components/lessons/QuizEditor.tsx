import type { QuizContent, QuizQuestion, QuizOption, AgeHints } from '@kidspark/shared';

interface Props {
    content: QuizContent;
    onChange: (c: QuizContent) => void;
}

function newQuestion(): QuizQuestion {
    return {
        id: crypto.randomUUID(),
        question: '',
        question_type: 'multiple_choice',
        options: [
            { id: crypto.randomUUID(), text: '' },
            { id: crypto.randomUUID(), text: '' },
        ],
        correct_answer: '',
        explanation: '',
        hints: {},
        points: 10,
    };
}

export function QuizEditor({ content, onChange }: Props) {
    function updateQuestion(idx: number, patch: Partial<QuizQuestion>) {
        const questions = content.questions.map((q, i) => i === idx ? { ...q, ...patch } : q);
        onChange({ ...content, questions });
    }

    function addOption(qIdx: number) {
        const q = content.questions[qIdx];
        updateQuestion(qIdx, { options: [...q.options, { id: crypto.randomUUID(), text: '' }] });
    }

    function removeOption(qIdx: number, optId: string) {
        const q = content.questions[qIdx];
        updateQuestion(qIdx, { options: q.options.filter((o) => o.id !== optId) });
    }

    function updateOption(qIdx: number, optId: string, patch: Partial<QuizOption>) {
        const q = content.questions[qIdx];
        const options = q.options.map((o) => o.id === optId ? { ...o, ...patch } : o);
        updateQuestion(qIdx, { options });
    }

    function updateHint(qIdx: number, age: keyof AgeHints, hint: string) {
        const q = content.questions[qIdx];
        updateQuestion(qIdx, { hints: { ...q.hints, [age]: hint } });
    }

    return (
        <div className="space-y-4">
            {/* Character */}
            <div className="card bg-base-200 border border-base-300">
                <div className="card-body p-4 gap-3">
                    <h3 className="font-semibold text-sm">Character</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <label className="form-control">
                            <div className="label py-0"><span className="label-text text-xs">Name</span></div>
                            <input className="input input-bordered input-sm" value={content.character.name}
                                onChange={e => onChange({ ...content, character: { ...content.character, name: e.target.value } })} />
                        </label>
                        <label className="form-control">
                            <div className="label py-0"><span className="label-text text-xs">Avatar Key</span></div>
                            <input className="input input-bordered input-sm font-mono" value={content.character.avatar_key}
                                onChange={e => onChange({ ...content, character: { ...content.character, avatar_key: e.target.value } })} />
                        </label>
                        <label className="form-control">
                            <div className="label py-0"><span className="label-text text-xs">Personality</span></div>
                            <input className="input input-bordered input-sm" value={content.character.personality}
                                onChange={e => onChange({ ...content, character: { ...content.character, personality: e.target.value } })} />
                        </label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <label className="form-control">
                    <div className="label py-0"><span className="label-text text-xs">Passing Score (%)</span></div>
                    <input type="number" className="input input-bordered input-sm" min={0} max={100}
                        value={content.passing_score ?? ''}
                        onChange={e => onChange({ ...content, passing_score: Number(e.target.value) })} />
                </label>
                <label className="form-control">
                    <div className="label py-0"><span className="label-text text-xs">Completion Message</span></div>
                    <input className="input input-bordered input-sm" value={content.completion_message ?? ''}
                        onChange={e => onChange({ ...content, completion_message: e.target.value })} />
                </label>
            </div>

            {/* Questions */}
            {content.questions.map((q, qIdx) => (
                <div key={q.id} className="card bg-base-100 border border-base-300">
                    <div className="card-body p-4 gap-3">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm">Question {qIdx + 1}</span>
                            <button type="button"
                                onClick={() => onChange({ ...content, questions: content.questions.filter((_, i) => i !== qIdx) })}
                                className="btn btn-ghost btn-xs text-error">Remove</button>
                        </div>

                        <label className="form-control">
                            <div className="label py-0"><span className="label-text text-xs">Question *</span></div>
                            <textarea className="textarea textarea-bordered textarea-sm" rows={2}
                                value={q.question} onChange={e => updateQuestion(qIdx, { question: e.target.value })} />
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="form-control">
                                <div className="label py-0"><span className="label-text text-xs">Type</span></div>
                                <select className="select select-bordered select-sm" value={q.question_type}
                                    onChange={e => updateQuestion(qIdx, { question_type: e.target.value })}>
                                    <option value="multiple_choice">Multiple Choice</option>
                                    <option value="true_false">True / False</option>
                                    <option value="image_choice">Image Choice</option>
                                </select>
                            </label>
                            <label className="form-control">
                                <div className="label py-0"><span className="label-text text-xs">Points</span></div>
                                <input type="number" className="input input-bordered input-sm" value={q.points}
                                    onChange={e => updateQuestion(qIdx, { points: Number(e.target.value) })} />
                            </label>
                        </div>

                        {/* Options */}
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-base-content/60">Options</p>
                            {q.options.map((opt) => (
                                <div key={opt.id} className="flex gap-2 items-center">
                                    <input type="radio" name={`correct-${q.id}`} className="radio radio-sm radio-success"
                                        checked={q.correct_answer === opt.id}
                                        onChange={() => updateQuestion(qIdx, { correct_answer: opt.id })} />
                                    <input className="input input-bordered input-sm flex-1" value={opt.text}
                                        placeholder="Option text…"
                                        onChange={e => updateOption(qIdx, opt.id, { text: e.target.value })} />
                                    <button type="button" onClick={() => removeOption(qIdx, opt.id)}
                                        className="btn btn-ghost btn-xs text-error">✕</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addOption(qIdx)} className="btn btn-ghost btn-xs">+ Add Option</button>
                        </div>

                        <label className="form-control">
                            <div className="label py-0"><span className="label-text text-xs">Explanation</span></div>
                            <input className="input input-bordered input-sm" value={q.explanation}
                                onChange={e => updateQuestion(qIdx, { explanation: e.target.value })} />
                        </label>

                        {/* Hints */}
                        <details className="collapse collapse-arrow border border-base-200 rounded-lg">
                            <summary className="collapse-title text-xs font-medium py-2 min-h-0">Age Hints</summary>
                            <div className="collapse-content space-y-2 pb-2">
                                {(['3-5', '6-8', '9-12'] as Array<keyof AgeHints>).map(age => (
                                    <label key={age} className="form-control">
                                        <div className="label py-0"><span className="label-text text-xs">Ages {age}</span></div>
                                        <input className="input input-bordered input-xs" value={q.hints[age] ?? ''}
                                            onChange={e => updateHint(qIdx, age, e.target.value)}
                                            placeholder={`Hint for ages ${age}…`} />
                                    </label>
                                ))}
                            </div>
                        </details>
                    </div>
                </div>
            ))}

            <button type="button" onClick={() => onChange({ ...content, questions: [...content.questions, newQuestion()] })}
                className="btn btn-dashed btn-sm w-full">
                + Add Question
            </button>
        </div>
    );
}
