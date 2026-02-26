import type { SandboxContent, SandboxItem, SandboxZone, AgeHints } from '@kidspark/shared';

interface Props {
    content: SandboxContent;
    onChange: (c: SandboxContent) => void;
}

function newItem(): SandboxItem {
    return { id: crypto.randomUUID(), label: '', category: '', correct_zone_id: '' };
}

function newZone(): SandboxZone {
    return { id: crypto.randomUUID(), label: '', accepts: [] };
}

export function SandboxEditor({ content, onChange }: Props) {
    function updateItem(idx: number, patch: Partial<SandboxItem>) {
        onChange({ ...content, items: content.items.map((it, i) => i === idx ? { ...it, ...patch } : it) });
    }

    function updateZone(idx: number, patch: Partial<SandboxZone>) {
        onChange({ ...content, zones: (content.zones ?? []).map((z, i) => i === idx ? { ...z, ...patch } : z) });
    }

    function updateHint(age: keyof AgeHints, val: string) {
        onChange({ ...content, hints: { ...content.hints, [age]: val } });
    }

    return (
        <div className="space-y-4">
            {/* Character */}
            <div className="card bg-base-200 border border-base-300">
                <div className="card-body p-4 gap-3">
                    <h3 className="font-semibold text-sm">Character</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {(['name', 'avatar_key', 'personality'] as const).map((field) => (
                            <label key={field} className="form-control">
                                <div className="label py-0"><span className="label-text text-xs capitalize">{field.replace('_', ' ')}</span></div>
                                <input className="input input-bordered input-sm" value={content.character[field]}
                                    onChange={e => onChange({ ...content, character: { ...content.character, [field]: e.target.value } })} />
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Config */}
            <div className="grid grid-cols-2 gap-4">
                <label className="form-control">
                    <div className="label py-0"><span className="label-text text-xs">Sandbox Type</span></div>
                    <select className="select select-bordered select-sm" value={content.sandbox_type}
                        onChange={e => onChange({ ...content, sandbox_type: e.target.value as SandboxContent['sandbox_type'] })}>
                        <option value="drag_and_drop">Drag & Drop</option>
                        <option value="sorting">Sorting</option>
                        <option value="matching">Matching</option>
                    </select>
                </label>
                <label className="form-control">
                    <div className="label py-0"><span className="label-text text-xs">Completion Type</span></div>
                    <select className="select select-bordered select-sm" value={content.completion_criteria.type}
                        onChange={e => onChange({ ...content, completion_criteria: { ...content.completion_criteria, type: e.target.value } })}>
                        <option value="all_placed">All Placed</option>
                        <option value="min_score">Min Score</option>
                        <option value="time_limit">Time Limit</option>
                    </select>
                </label>
            </div>

            {/* Items */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <p className="font-medium text-sm">Items</p>
                    <button type="button" onClick={() => onChange({ ...content, items: [...content.items, newItem()] })}
                        className="btn btn-ghost btn-xs">+ Add Item</button>
                </div>
                {content.items.map((item, idx) => (
                    <div key={item.id} className="card bg-base-100 border border-base-300">
                        <div className="card-body p-3 gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-base-content/60">Item {idx + 1}</span>
                                <button type="button" onClick={() => onChange({ ...content, items: content.items.filter((_, i) => i !== idx) })}
                                    className="btn btn-ghost btn-xs text-error">✕</button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <label className="form-control">
                                    <div className="label py-0"><span className="label-text text-xs">Label</span></div>
                                    <input className="input input-bordered input-xs" value={item.label}
                                        onChange={e => updateItem(idx, { label: e.target.value })} />
                                </label>
                                <label className="form-control">
                                    <div className="label py-0"><span className="label-text text-xs">Category</span></div>
                                    <input className="input input-bordered input-xs" value={item.category ?? ''}
                                        onChange={e => updateItem(idx, { category: e.target.value })} />
                                </label>
                                <label className="form-control">
                                    <div className="label py-0"><span className="label-text text-xs">Correct Zone ID</span></div>
                                    <input className="input input-bordered input-xs" value={item.correct_zone_id ?? ''}
                                        onChange={e => updateItem(idx, { correct_zone_id: e.target.value })} />
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Zones */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <p className="font-medium text-sm">Drop Zones</p>
                    <button type="button" onClick={() => onChange({ ...content, zones: [...(content.zones ?? []), newZone()] })}
                        className="btn btn-ghost btn-xs">+ Add Zone</button>
                </div>
                {(content.zones ?? []).map((zone, idx) => (
                    <div key={zone.id} className="card bg-base-100 border border-base-300">
                        <div className="card-body p-3 gap-2">
                            <div className="grid grid-cols-3 gap-2">
                                <label className="form-control">
                                    <div className="label py-0"><span className="label-text text-xs">Zone ID</span></div>
                                    <input className="input input-bordered input-xs font-mono" value={zone.id}
                                        onChange={e => updateZone(idx, { id: e.target.value })} />
                                </label>
                                <label className="form-control">
                                    <div className="label py-0"><span className="label-text text-xs">Label</span></div>
                                    <input className="input input-bordered input-xs" value={zone.label}
                                        onChange={e => updateZone(idx, { label: e.target.value })} />
                                </label>
                                <button type="button" onClick={() => onChange({ ...content, zones: (content.zones ?? []).filter((_, i) => i !== idx) })}
                                    className="btn btn-ghost btn-xs text-error self-end">Remove</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Hints */}
            <div className="card bg-base-200 border border-base-300">
                <div className="card-body p-4 gap-3">
                    <h3 className="font-semibold text-sm">Age Hints</h3>
                    {(['3-5', '6-8', '9-12'] as Array<keyof AgeHints>).map(age => (
                        <label key={age} className="form-control">
                            <div className="label py-0"><span className="label-text text-xs">Ages {age}</span></div>
                            <input className="input input-bordered input-sm" value={content.hints[age] ?? ''}
                                onChange={e => updateHint(age, e.target.value)} placeholder={`Hint for ages ${age}…`} />
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
