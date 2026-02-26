import type { StoryContent, StoryPage, AgeVariants } from '@kidspark/shared';

interface Props {
    content: StoryContent;
    onChange: (c: StoryContent) => void;
}

function newPage(): StoryPage {
    return { id: crypto.randomUUID(), narration: '', character_dialogue: '', image_key: '' };
}

export function StoryEditor({ content, onChange }: Props) {
    function updatePage(idx: number, patch: Partial<StoryPage>) {
        const pages = content.pages.map((p, i) => i === idx ? { ...p, ...patch } : p);
        onChange({ ...content, pages });
    }

    function updateAgeVariant(idx: number, age: keyof AgeVariants, narration: string) {
        const page = content.pages[idx];
        const age_variants: AgeVariants = { ...page.age_variants, [age]: { narration } };
        updatePage(idx, { age_variants });
    }

    function addPage() {
        onChange({ ...content, pages: [...content.pages, newPage()] });
    }

    function removePage(idx: number) {
        onChange({ ...content, pages: content.pages.filter((_, i) => i !== idx) });
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

            {/* Pages */}
            {content.pages.map((page, idx) => (
                <div key={page.id} className="card bg-base-100 border border-base-300">
                    <div className="card-body p-4 gap-3">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm">Page {idx + 1}</span>
                            <button type="button" onClick={() => removePage(idx)} className="btn btn-ghost btn-xs text-error">Remove</button>
                        </div>

                        <label className="form-control">
                            <div className="label py-0"><span className="label-text text-xs">Narration *</span></div>
                            <textarea className="textarea textarea-bordered textarea-sm" rows={3}
                                value={page.narration}
                                onChange={e => updatePage(idx, { narration: e.target.value })} />
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="form-control">
                                <div className="label py-0"><span className="label-text text-xs">Character Dialogue</span></div>
                                <input className="input input-bordered input-sm" value={page.character_dialogue ?? ''}
                                    onChange={e => updatePage(idx, { character_dialogue: e.target.value })} />
                            </label>
                            <label className="form-control">
                                <div className="label py-0"><span className="label-text text-xs">Image Key (R2)</span></div>
                                <input className="input input-bordered input-sm font-mono" value={page.image_key ?? ''}
                                    onChange={e => updatePage(idx, { image_key: e.target.value })} />
                            </label>
                        </div>

                        {/* Age Variants */}
                        <details className="collapse collapse-arrow border border-base-200 rounded-lg">
                            <summary className="collapse-title text-xs font-medium py-2 min-h-0">Age Variants</summary>
                            <div className="collapse-content space-y-2 pb-2">
                                {(['3-5', '6-8', '9-12'] as Array<keyof AgeVariants>).map(age => (
                                    <label key={age} className="form-control">
                                        <div className="label py-0"><span className="label-text text-xs">Ages {age}</span></div>
                                        <textarea className="textarea textarea-bordered textarea-xs" rows={2}
                                            value={page.age_variants?.[age]?.narration ?? ''}
                                            onChange={e => updateAgeVariant(idx, age, e.target.value)}
                                            placeholder={`Narration for ages ${age}…`} />
                                    </label>
                                ))}
                            </div>
                        </details>
                    </div>
                </div>
            ))}

            <button type="button" onClick={addPage} className="btn btn-dashed btn-sm w-full">
                + Add Page
            </button>
        </div>
    );
}
