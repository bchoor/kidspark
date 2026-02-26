import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useThemes } from '../../hooks/useThemes';
import { api } from '../../lib/api';

export function ThemeListPage() {
    const { themes, loading, error, refresh } = useThemes();
    const [deleting, setDeleting] = useState<number | null>(null);
    const navigate = useNavigate();

    async function handleDelete(id: number) {
        if (!confirm('Delete this theme?')) return;
        setDeleting(id);
        try { await api.themes.delete(id); refresh(); }
        catch (err) { alert(err instanceof Error ? err.message : 'Delete failed'); }
        finally { setDeleting(null); }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Themes</h1>
                    <p className="text-base-content/60 text-sm">Character themes for lessons</p>
                </div>
                <Link to="/cms/themes/new" className="btn btn-primary btn-sm">+ New Theme</Link>
            </div>

            {loading && <div className="flex justify-center py-8"><span className="loading loading-spinner" /></div>}
            {error && <div className="alert alert-error"><span>{error}</span></div>}

            {!loading && themes.length === 0 && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body text-center text-base-content/50">
                        No themes yet. <Link to="/cms/themes/new" className="link">Create one</Link>.
                    </div>
                </div>
            )}

            {themes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {themes.map((t) => {
                        let palette: Record<string, string> = {};
                        try { palette = JSON.parse(t.color_palette); } catch { /* empty */ }
                        return (
                            <div key={t.id} className="card bg-base-100 shadow hover:shadow-md transition-shadow">
                                <div className="card-body p-4 gap-2">
                                    <div className="flex items-center gap-2">
                                        {t.icon_key && <span className="text-2xl">{t.icon_key}</span>}
                                        <h3 className="font-semibold">{t.name}</h3>
                                    </div>
                                    {t.description && <p className="text-xs text-base-content/60 line-clamp-2">{t.description}</p>}
                                    {Object.keys(palette).length > 0 && (
                                        <div className="flex gap-1">
                                            {Object.values(palette).slice(0, 5).map((color, i) => (
                                                <div key={i} className="w-5 h-5 rounded-full border border-base-200" style={{ backgroundColor: color }} />
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-1 mt-1">
                                        <button onClick={() => navigate(`/cms/themes/${t.id}`)} className="btn btn-ghost btn-xs flex-1">Edit</button>
                                        <button onClick={() => handleDelete(t.id)} disabled={deleting === t.id} className="btn btn-ghost btn-xs text-error">
                                            {deleting === t.id ? <span className="loading loading-spinner loading-xs" /> : 'Del'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
