import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

interface Stats {
    courses: number;
    lessons: number;
    publishedLessons: number;
    kids: number;
    topics: number;
    themes: number;
}

export function DashboardPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.courses.list(),
            api.lessons.list(),
            api.kids.list(),
            api.topics.list(),
            api.themes.list(),
        ])
            .then(([courses, lessons, kids, topics, themes]) => {
                setStats({
                    courses: courses.length,
                    lessons: lessons.length,
                    publishedLessons: lessons.filter((l) => l.status === 'published').length,
                    kids: kids.length,
                    topics: topics.length,
                    themes: themes.length,
                });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const statCards = stats
        ? [
            { label: 'Courses', value: stats.courses, to: '/courses', color: 'text-primary', icon: '📚' },
            { label: 'Lessons', value: `${stats.publishedLessons} / ${stats.lessons}`, to: '/lessons', color: 'text-success', icon: '📖', sub: 'published' },
            { label: 'Kids', value: stats.kids, to: '/kids', color: 'text-secondary', icon: '👦' },
            { label: 'Topics', value: stats.topics, to: '/topics', color: 'text-accent', icon: '🦕' },
            { label: 'Themes', value: stats.themes, to: '/themes', color: 'text-warning', icon: '🎨' },
        ]
        : [];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-base-content/60 text-sm mt-1">Overview of your KidSpark content</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {statCards.map((card) => (
                        <Link
                            key={card.label}
                            to={card.to}
                            className="card bg-base-100 shadow hover:shadow-md transition-shadow"
                        >
                            <div className="card-body p-4 gap-1">
                                <span className="text-2xl">{card.icon}</span>
                                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                                <p className="text-sm text-base-content/60">{card.label}</p>
                                {card.sub && (
                                    <p className="text-xs text-base-content/40">{card.sub}</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Quick actions */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title text-base">Quick Actions</h2>
                    <div className="flex flex-wrap gap-2">
                        <Link to="/courses/new" className="btn btn-sm btn-outline">
                            + New Course
                        </Link>
                        <Link to="/lessons/new" className="btn btn-sm btn-outline">
                            + New Lesson
                        </Link>
                        <Link to="/topics/new" className="btn btn-sm btn-outline">
                            + New Topic
                        </Link>
                        <Link to="/themes/new" className="btn btn-sm btn-outline">
                            + New Theme
                        </Link>
                        <Link to="/kids/new" className="btn btn-sm btn-outline">
                            + Add Kid
                        </Link>
                        <Link to="/passwords/new" className="btn btn-sm btn-outline">
                            + Create Password
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
