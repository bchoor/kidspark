import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLessons } from '../../hooks/useLessons';
import { useCourses } from '../../hooks/useCourses';
import { api } from '../../lib/api';

const ACTIVITY_COLORS: Record<string, string> = {
    story: 'badge-info',
    quiz: 'badge-warning',
    sandbox: 'badge-accent',
    mixed: 'badge-secondary',
};

export function LessonListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const courseIdParam = searchParams.get('course_id');
    const courseId = courseIdParam ? Number(courseIdParam) : undefined;

    const { lessons, loading, error, refresh } = useLessons(courseId);
    const { courses } = useCourses();
    const [deleting, setDeleting] = useState<number | null>(null);
    const [toggling, setToggling] = useState<number | null>(null);
    const navigate = useNavigate();

    async function handleDelete(id: number) {
        if (!confirm('Delete this lesson?')) return;
        setDeleting(id);
        try { await api.lessons.delete(id); refresh(); }
        catch (err) { alert(err instanceof Error ? err.message : 'Delete failed'); }
        finally { setDeleting(null); }
    }

    async function handleTogglePublish(id: number, status: string) {
        setToggling(id);
        try {
            if (status === 'published') await api.lessons.unpublish(id);
            else await api.lessons.publish(id);
            refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed');
        } finally {
            setToggling(null);
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Lessons</h1>
                    <p className="text-base-content/60 text-sm">Individual lesson units</p>
                </div>
                <Link to="/lessons/new" className="btn btn-primary btn-sm">+ New Lesson</Link>
            </div>

            {/* Course filter */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-base-content/60">Filter by course:</span>
                <select
                    className="select select-bordered select-sm"
                    value={courseId ?? ''}
                    onChange={e => {
                        if (e.target.value) setSearchParams({ course_id: e.target.value });
                        else setSearchParams({});
                    }}
                >
                    <option value="">All courses</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
            </div>

            {loading && <div className="flex justify-center py-8"><span className="loading loading-spinner" /></div>}
            {error && <div className="alert alert-error"><span>{error}</span></div>}

            {!loading && lessons.length === 0 && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body text-center text-base-content/50">
                        No lessons yet. <Link to="/lessons/new" className="link">Create one</Link>.
                    </div>
                </div>
            )}

            {lessons.length > 0 && (
                <div className="card bg-base-100 shadow overflow-hidden">
                    <table className="table table-sm">
                        <thead>
                            <tr><th>#</th><th>Title</th><th>Type</th><th>Status</th><th className="w-40" /></tr>
                        </thead>
                        <tbody>
                            {lessons.map((l) => (
                                <tr key={l.id} className="hover">
                                    <td className="text-base-content/40 text-sm">{l.sort_order}</td>
                                    <td>
                                        <p className="font-medium">{l.title}</p>
                                        <p className="text-xs font-mono text-base-content/40">{l.slug}</p>
                                    </td>
                                    <td>
                                        <span className={`badge badge-sm ${ACTIVITY_COLORS[l.activity_type] ?? 'badge-ghost'}`}>
                                            {l.activity_type}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleTogglePublish(l.id, l.status)}
                                            disabled={toggling === l.id}
                                            className={`badge badge-sm cursor-pointer hover:opacity-80 ${l.status === 'published' ? 'badge-success' : 'badge-ghost'}`}
                                        >
                                            {toggling === l.id ? <span className="loading loading-spinner loading-xs" /> : l.status}
                                        </button>
                                    </td>
                                    <td>
                                        <div className="flex gap-1">
                                            <button onClick={() => navigate(`/cms/lessons/${l.id}`)} className="btn btn-ghost btn-xs">Edit</button>
                                            <button onClick={() => handleDelete(l.id)} disabled={deleting === l.id} className="btn btn-ghost btn-xs text-error">
                                                {deleting === l.id ? <span className="loading loading-spinner loading-xs" /> : 'Del'}
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
