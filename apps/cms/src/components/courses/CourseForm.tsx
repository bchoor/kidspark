import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Course } from '@kidspark/shared';

export function CourseForm() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        description: '',
        status: 'draft',
        sort_order: 0,
        cover_image_key: '',
    });
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isEdit) return;
        api.courses.get(Number(id))
            .then((c: Course) => setForm({
                title: c.title,
                description: c.description,
                status: c.status,
                sort_order: c.sort_order,
                cover_image_key: c.cover_image_key ?? '',
            }))
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id, isEdit]);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const data = {
                ...form,
                cover_image_key: form.cover_image_key || undefined,
            };
            if (isEdit) await api.courses.update(Number(id), data);
            else await api.courses.create(data);
            navigate('/courses');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Save failed');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>;

    return (
        <div className="max-w-xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">{isEdit ? 'Edit Course' : 'New Course'}</h1>
            <div className="card bg-base-100 shadow">
                <form onSubmit={handleSubmit} className="card-body gap-4">
                    <label className="form-control">
                        <div className="label"><span className="label-text">Title *</span></div>
                        <input className="input input-bordered" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                    </label>

                    <label className="form-control">
                        <div className="label"><span className="label-text">Description</span></div>
                        <textarea className="textarea textarea-bordered" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="form-control">
                            <div className="label"><span className="label-text">Status</span></div>
                            <select className="select select-bordered" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </label>
                        <label className="form-control">
                            <div className="label"><span className="label-text">Sort Order</span></div>
                            <input type="number" className="input input-bordered" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
                        </label>
                    </div>

                    <label className="form-control">
                        <div className="label"><span className="label-text">Cover Image Key (R2)</span></div>
                        <input className="input input-bordered font-mono text-sm" value={form.cover_image_key} placeholder="e.g. courses/dino-racing/cover.jpg" onChange={e => setForm(f => ({ ...f, cover_image_key: e.target.value }))} />
                    </label>

                    {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => navigate('/courses')} className="btn btn-ghost">Cancel</button>
                        <button type="submit" disabled={saving} className="btn btn-primary">
                            {saving ? <span className="loading loading-spinner loading-sm" /> : isEdit ? 'Save' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
