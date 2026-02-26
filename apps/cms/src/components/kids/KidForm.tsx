import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Kid } from '@kidspark/shared';

const AVATARS = ['🦁', '🐯', '🐻', '🐼', '🦊', '🐺', '🦄', '🐸', '🐧', '🦋'];

export function KidForm() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: '', age: 5, avatar: '🦁' });
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isEdit) return;
        api.kids.get(Number(id))
            .then((k: Kid) => setForm({ name: k.name, age: k.age, avatar: k.avatar ?? '🦁' }))
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id, isEdit]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            if (isEdit) await api.kids.update(Number(id), form);
            else await api.kids.create(form);
            navigate('/cms/kids');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Save failed');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>;

    return (
        <div className="max-w-md mx-auto space-y-4">
            <h1 className="text-2xl font-bold">{isEdit ? 'Edit Kid' : 'Add Kid'}</h1>
            <div className="card bg-base-100 shadow">
                <form onSubmit={handleSubmit} className="card-body gap-4">
                    <label className="form-control">
                        <div className="label"><span className="label-text">Name *</span></div>
                        <input className="input input-bordered" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                    </label>

                    <label className="form-control">
                        <div className="label"><span className="label-text">Age *</span></div>
                        <input type="number" className="input input-bordered" min={1} max={18} value={form.age} onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))} required />
                    </label>

                    <div className="form-control">
                        <div className="label"><span className="label-text">Avatar</span></div>
                        <div className="flex flex-wrap gap-2">
                            {AVATARS.map((a) => (
                                <button
                                    key={a}
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, avatar: a }))}
                                    className={`text-2xl w-10 h-10 rounded-lg border-2 transition-colors ${form.avatar === a ? 'border-primary bg-primary/10' : 'border-base-300'}`}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => navigate('/cms/kids')} className="btn btn-ghost">Cancel</button>
                        <button type="submit" disabled={saving} className="btn btn-primary">
                            {saving ? <span className="loading loading-spinner loading-sm" /> : isEdit ? 'Save' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
