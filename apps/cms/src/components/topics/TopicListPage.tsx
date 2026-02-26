import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTopics } from '../../hooks/useTopics';
import { api } from '../../lib/api';

export function TopicListPage() {
    const { topics, loading, error, refresh } = useTopics();
    const [deleting, setDeleting] = useState<number | null>(null);
    const navigate = useNavigate();

    async function handleDelete(id: number) {
        if (!confirm('Delete this topic?')) return;
        setDeleting(id);
        try { await api.topics.delete(id); refresh(); }
        catch (err) { alert(err instanceof Error ? err.message : 'Delete failed'); }
        finally { setDeleting(null); }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Topics</h1>
                    <p className="text-base-content/60 text-sm">Subject areas for lessons</p>
                </div>
                <Link to="/topics/new" className="btn btn-primary btn-sm">+ New Topic</Link>
            </div>

            {loading && <div className="flex justify-center py-8"><span className="loading loading-spinner" /></div>}
            {error && <div className="alert alert-error"><span>{error}</span></div>}

            {!loading && topics.length === 0 && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body text-center text-base-content/50">
                        No topics yet. <Link to="/topics/new" className="link">Create one</Link>.
                    </div>
                </div>
            )}

            {topics.length > 0 && (
                <div className="card bg-base-100 shadow overflow-hidden">
                    <table className="table table-sm">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Age Range</th>
                                <th>Status</th>
                                <th className="w-24" />
                            </tr>
                        </thead>
                        <tbody>
                            {topics.map((t) => (
                                <tr key={t.id} className="hover">
                                    <td>
                                        <p className="font-medium">{t.title}</p>
                                        {t.description && <p className="text-xs text-base-content/50 truncate max-w-xs">{t.description}</p>}
                                    </td>
                                    <td className="text-sm">{t.age_min}–{t.age_max} yrs</td>
                                    <td>
                                        <span className={`badge badge-sm ${t.status === 'published' ? 'badge-success' : 'badge-ghost'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-1">
                                            <button onClick={() => navigate(`/topics/${t.id}`)} className="btn btn-ghost btn-xs">Edit</button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                disabled={deleting === t.id}
                                                className="btn btn-ghost btn-xs text-error"
                                            >
                                                {deleting === t.id ? <span className="loading loading-spinner loading-xs" /> : 'Del'}
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
