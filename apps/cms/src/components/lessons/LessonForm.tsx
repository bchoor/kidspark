import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useCourses } from '../../hooks/useCourses';
import { useTopics } from '../../hooks/useTopics';
import { useThemes } from '../../hooks/useThemes';
import { ActivityEditor } from './ActivityEditor';
import { MediaBrowser } from '../media/MediaBrowser';
import type { Lesson, LessonContent } from '@kidspark/shared';

export function LessonForm() {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const { courses } = useCourses();
    const { topics } = useTopics();
    const { themes } = useThemes();

    const [form, setForm] = useState({
        course_id: '',
        topic_id: '',
        theme_id: '',
        title: '',
        sort_order: 0,
        activity_type: 'story',
    });
    const [content, setContent] = useState<LessonContent | null>(null);
    const [status, setStatus] = useState('draft');
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'media'>('content');

    useEffect(() => {
        if (!isEdit) return;
        api.lessons.get(Number(id))
            .then((l: Lesson) => {
                setForm({
                    course_id: String(l.course_id),
                    topic_id: String(l.topic_id),
                    theme_id: String(l.theme_id),
                    title: l.title,
                    sort_order: l.sort_order,
                    activity_type: l.activity_type,
                });
                try { setContent(JSON.parse(l.content_json)); } catch { /* use null */ }
                setStatus(l.status);
            })
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id, isEdit]);

    async function handleSave(e: FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const data = {
                course_id: Number(form.course_id),
                topic_id: Number(form.topic_id),
                theme_id: Number(form.theme_id),
                title: form.title,
                sort_order: form.sort_order,
                activity_type: form.activity_type,
                content_json: JSON.stringify(content ?? {}),
            };
            if (isEdit) {
                await api.lessons.update(Number(id), data);
            } else {
                const created = await api.lessons.create(data);
                navigate(`/cms/lessons/${created.id}`, { replace: true });
                return;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Save failed');
        } finally {
            setSaving(false);
        }
    }

    async function handlePublish() {
        if (!isEdit) return;
        setPublishing(true);
        try {
            if (status === 'published') {
                await api.lessons.unpublish(Number(id));
                setStatus('draft');
            } else {
                await api.lessons.publish(Number(id));
                setStatus('published');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed');
        } finally {
            setPublishing(false);
        }
    }

    if (loading) return <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">{isEdit ? 'Edit Lesson' : 'New Lesson'}</h1>
                    {isEdit && (
                        <span className={`badge badge-sm mt-1 ${status === 'published' ? 'badge-success' : 'badge-ghost'}`}>
                            {status}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {isEdit && (
                        <button
                            type="button"
                            onClick={handlePublish}
                            disabled={publishing}
                            className={`btn btn-sm ${status === 'published' ? 'btn-warning' : 'btn-success'}`}
                        >
                            {publishing
                                ? <span className="loading loading-spinner loading-xs" />
                                : status === 'published' ? 'Unpublish' : 'Publish'
                            }
                        </button>
                    )}
                </div>
            </div>

            {/* Metadata card */}
            <div className="card bg-base-100 shadow">
                <div className="card-body p-4 gap-4">
                    <h2 className="font-semibold text-sm">Lesson Details</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="form-control">
                            <div className="label py-0"><span className="label-text text-xs">Course *</span></div>
                            <select className="select select-bordered select-sm" value={form.course_id}
                                onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))} required>
                                <option value="">Select course…</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </label>
                        <label className="form-control">
                            <div className="label py-0"><span className="label-text text-xs">Topic *</span></div>
                            <select className="select select-bordered select-sm" value={form.topic_id}
                                onChange={e => setForm(f => ({ ...f, topic_id: e.target.value }))} required>
                                <option value="">Select topic…</option>
                                {topics.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                            </select>
                        </label>
                        <label className="form-control">
                            <div className="label py-0"><span className="label-text text-xs">Theme *</span></div>
                            <select className="select select-bordered select-sm" value={form.theme_id}
                                onChange={e => setForm(f => ({ ...f, theme_id: e.target.value }))} required>
                                <option value="">Select theme…</option>
                                {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="form-control sm:col-span-2">
                            <div className="label py-0"><span className="label-text text-xs">Title *</span></div>
                            <input className="input input-bordered input-sm" value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                        </label>
                        <label className="form-control">
                            <div className="label py-0"><span className="label-text text-xs">Sort Order</span></div>
                            <input type="number" className="input input-bordered input-sm" value={form.sort_order}
                                onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
                        </label>
                    </div>

                    <label className="form-control">
                        <div className="label py-0"><span className="label-text text-xs">Activity Type *</span></div>
                        <select className="select select-bordered select-sm w-48" value={form.activity_type}
                            onChange={e => setForm(f => ({ ...f, activity_type: e.target.value }))}>
                            <option value="story">Story</option>
                            <option value="quiz">Quiz</option>
                            <option value="sandbox">Sandbox</option>
                            <option value="mixed">Mixed (Story + Quiz)</option>
                        </select>
                    </label>
                </div>
            </div>

            {/* Content / Media tabs */}
            <div role="tablist" className="tabs tabs-bordered">
                <button
                    role="tab"
                    type="button"
                    className={`tab ${activeTab === 'content' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('content')}
                >
                    Content Editor
                </button>
                {isEdit && (
                    <button
                        role="tab"
                        type="button"
                        className={`tab ${activeTab === 'media' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('media')}
                    >
                        Media
                    </button>
                )}
            </div>

            {activeTab === 'content' && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body p-4">
                        <ActivityEditor
                            activityType={form.activity_type}
                            content={content}
                            onChange={setContent}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'media' && isEdit && (
                <MediaBrowser lessonId={Number(id)} />
            )}

            {error && <div className="alert alert-error text-sm"><span>{error}</span></div>}

            {/* Actions */}
            <div className="flex justify-end gap-2 pb-4">
                <button type="button" onClick={() => navigate('/lessons')} className="btn btn-ghost btn-sm">Cancel</button>
                <button type="button" onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm">
                    {saving ? <span className="loading loading-spinner loading-xs" /> : isEdit ? 'Save Changes' : 'Create Lesson'}
                </button>
            </div>
        </div>
    );
}
