import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useKids } from '../../hooks/useKids';
import { api } from '../../lib/api';

export function KidListPage() {
    const { kids, loading, error, refresh } = useKids();
    const [deleting, setDeleting] = useState<number | null>(null);
    const navigate = useNavigate();

    async function handleDelete(id: number) {
        if (!confirm('Delete this kid profile?')) return;
        setDeleting(id);
        try { await api.kids.delete(id); refresh(); }
        catch (err) { alert(err instanceof Error ? err.message : 'Delete failed'); }
        finally { setDeleting(null); }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Kids</h1>
                    <p className="text-base-content/60 text-sm">Kid profiles for the learning app</p>
                </div>
                <Link to="/kids/new" className="btn btn-primary btn-sm">+ Add Kid</Link>
            </div>

            {loading && <div className="flex justify-center py-8"><span className="loading loading-spinner" /></div>}
            {error && <div className="alert alert-error"><span>{error}</span></div>}

            {!loading && kids.length === 0 && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body text-center text-base-content/50">
                        No kids yet. <Link to="/kids/new" className="link">Add one</Link>.
                    </div>
                </div>
            )}

            {kids.length > 0 && (
                <div className="card bg-base-100 shadow overflow-hidden">
                    <table className="table table-sm">
                        <thead><tr><th>Kid</th><th>Age</th><th className="w-24" /></tr></thead>
                        <tbody>
                            {kids.map((k) => (
                                <tr key={k.id} className="hover">
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar placeholder">
                                                <div className="bg-neutral text-neutral-content w-8 rounded-full">
                                                    <span className="text-sm">{k.avatar ?? k.name[0]}</span>
                                                </div>
                                            </div>
                                            <span className="font-medium">{k.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-sm">{k.age} yrs</td>
                                    <td>
                                        <div className="flex gap-1">
                                            <button onClick={() => navigate(`/kids/${k.id}`)} className="btn btn-ghost btn-xs">Edit</button>
                                            <button onClick={() => handleDelete(k.id)} disabled={deleting === k.id} className="btn btn-ghost btn-xs text-error">
                                                {deleting === k.id ? <span className="loading loading-spinner loading-xs" /> : 'Del'}
                                            </button>
                                        </div>
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
