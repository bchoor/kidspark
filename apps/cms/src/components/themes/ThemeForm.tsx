import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Theme } from '@kidspark/shared';

export function ThemeForm() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        description: '',
        icon_key: '',
        color_palette: '{}',
    });
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paletteError, setPaletteError] = useState<string | null>(null);

    useEffect(() => {
        if (!isEdit) return;
        api.themes.get(Number(id))
            .then((t: Theme) => setForm({ name: t.name, description: t.description, icon_key: t.icon_key ?? '', color_palette: t.color_palette }))
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id, isEdit]);

    function validatePalette(v: string) {
        try { JSON.parse(v); setPaletteError(null); }
        catch { setPaletteError('Must be valid JSON'); }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (paletteError) return;
        setSaving(true);
        setError(null);
        try {
            const data = { name: form.name, description: form.description, icon_key: form.icon_key || undefined, color_palette: form.color_palette };
            if (isEdit) await api.themes.update(Number(id), data);
            else await api.themes.create(data);
            navigate('/themes');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Save failed');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>;

    return (
        <div className="max-w-xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">{isEdit ? 'Edit Theme' : 'New Theme'}</h1>
            <div className="card bg-base-100 shadow">
                <form onSubmit={handleSubmit} className="card-body gap-4">
                    <label className="form-control">
                        <div className="label"><span className="label-text">Name *</span></div>
                        <input className="input input-bordered" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                    </label>

                    <label className="form-control">
                        <div className="label"><span className="label-text">Description</span></div>
                        <textarea className="textarea textarea-bordered" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </label>

                    <label className="form-control">
                        <div className="label"><span className="label-text">Icon (emoji or key)</span></div>
                        <input className="input input-bordered" value={form.icon_key} placeholder="🚗" onChange={e => setForm(f => ({ ...f, icon_key: e.target.value }))} />
                    </label>

                    <label className="form-control">
                        <div className="label">
                            <span className="label-text">Color Palette (JSON)</span>
                            {paletteError && <span className="label-text-alt text-error">{paletteError}</span>}
                        </div>
                        <textarea
                            className={`textarea textarea-bordered font-mono text-sm ${paletteError ? 'textarea-error' : ''}`}
                            rows={5}
                            value={form.color_palette}
                            onChange={e => { setForm(f => ({ ...f, color_palette: e.target.value })); validatePalette(e.target.value); }}
                            placeholder='{"primary":"#FF6B35","secondary":"#4ECDC4"}'
                        />
                    </label>

                    {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => navigate('/themes')} className="btn btn-ghost">Cancel</button>
                        <button type="submit" disabled={saving || !!paletteError} className="btn btn-primary">
                            {saving ? <span className="loading loading-spinner loading-sm" /> : isEdit ? 'Save' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
