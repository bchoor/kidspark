import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCourses } from '../../hooks/useCourses';
import { api } from '../../lib/api';

export function CourseListPage() {
    const { courses, loading, error, refresh } = useCourses();
    const [deleting, setDeleting] = useState<number | null>(null);
    const navigate = useNavigate();

    async function handleDelete(id: number) {
        if (!confirm('Delete this course and all its lessons?')) return;
        setDeleting(id);
        try { await api.courses.delete(id); refresh(); }
        catch (err) { alert(err instanceof Error ? err.message : 'Delete failed'); }
        finally { setDeleting(null); }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Courses</h1>
                    <p className="text-base-content/60 text-sm">Learning course collections</p>
                </div>
                <Link to="/courses/new" className="btn btn-primary btn-sm">+ New Course</Link>
            </div>

            {loading && <div className="flex justify-center py-8"><span className="loading loading-spinner" /></div>}
            {error && <div className="alert alert-error"><span>{error}</span></div>}

            {!loading && courses.length === 0 && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body text-center text-base-content/50">
                        No courses yet. <Link to="/courses/new" className="link">Create one</Link>.
                    </div>
                </div>
            )}

            {courses.length > 0 && (
                <div className="card bg-base-100 shadow overflow-hidden">
                    <table className="table table-sm">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Title</th>
                                <th>Slug</th>
                                <th>Status</th>
                                <th className="w-32" />
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((c) => (
                                <tr key={c.id} className="hover">
                                    <td className="text-base-content/40 text-sm">{c.sort_order}</td>
                                    <td>
                                        <p className="font-medium">{c.title}</p>
                                        {c.description && <p className="text-xs text-base-content/50 truncate max-w-xs">{c.description}</p>}
                                    </td>
                                    <td className="font-mono text-xs text-base-content/60">{c.slug}</td>
                                    <td>
                                        <span className={`badge badge-sm ${c.status === 'published' ? 'badge-success' : 'badge-ghost'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-1">
                                            <Link to={`/cms/lessons?course_id=${c.id}`} className="btn btn-ghost btn-xs">Lessons</Link>
                                            <button onClick={() => navigate(`/cms/courses/${c.id}`)} className="btn btn-ghost btn-xs">Edit</button>
                                            <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id} className="btn btn-ghost btn-xs text-error">
                                                {deleting === c.id ? <span className="loading loading-spinner loading-xs" /> : 'Del'}
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
