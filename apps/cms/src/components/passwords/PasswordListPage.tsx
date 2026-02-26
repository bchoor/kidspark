import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { AccessPassword } from '@kidspark/shared';

export function PasswordListPage() {
    const [passwords, setPasswords] = useState<AccessPassword[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ label: '', password: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function load() {
        setLoading(true);
        api.passwords.list()
            .then(setPasswords)
            .catch(console.error)
            .finally(() => setLoading(false));
    }

    useEffect(() => { load(); }, []);

    async function handleCreate(e: FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await api.passwords.create(form);
            setForm({ label: '', password: '' });
            setShowForm(false);
            load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Create failed');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Delete this password? Any active sessions using it will be invalidated.')) return;
        setDeleting(id);
        try { await api.passwords.delete(id); load(); }
        catch (err) { alert(err instanceof Error ? err.message : 'Delete failed'); }
        finally { setDeleting(null); }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Access Passwords</h1>
                    <p className="text-base-content/60 text-sm">Passwords for kid app access</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">+ New Password</button>
            </div>

            {showForm && (
                <div className="card bg-base-100 shadow">
                    <form onSubmit={handleCreate} className="card-body gap-3">
                        <h2 className="card-title text-base">Create Access Password</h2>
                        <label className="form-control">
                            <div className="label"><span className="label-text">Label *</span></div>
                            <input className="input input-bordered" placeholder="e.g. Family 2025" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required />
                        </label>
                        <label className="form-control">
                            <div className="label"><span className="label-text">Password *</span></div>
                            <input type="password" className="input input-bordered" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                        </label>
                        {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm">Cancel</button>
                            <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                                {saving ? <span className="loading loading-spinner loading-xs" /> : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading && <div className="flex justify-center py-8"><span className="loading loading-spinner" /></div>}

            {!loading && passwords.length === 0 && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body text-center text-base-content/50">No passwords yet.</div>
                </div>
            )}

            {passwords.length > 0 && (
                <div className="card bg-base-100 shadow overflow-hidden">
                    <table className="table table-sm">
                        <thead><tr><th>Label</th><th>Created</th><th>Last Used</th><th className="w-16" /></tr></thead>
                        <tbody>
                            {passwords.map((p) => (
                                <tr key={p.id} className="hover">
                                    <td className="font-medium">{p.label}</td>
                                    <td className="text-sm text-base-content/60">{new Date(p.created_at).toLocaleDateString()}</td>
                                    <td className="text-sm text-base-content/60">{p.last_used_at ? new Date(p.last_used_at).toLocaleDateString() : '—'}</td>
                                    <td>
                                        <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="btn btn-ghost btn-xs text-error">
                                            {deleting === p.id ? <span className="loading loading-spinner loading-xs" /> : 'Del'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
