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

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
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
            { label: 'Courses', value: stats.courses, to: '/courses', icon: '📚', accent: 'text-primary' },
            { label: 'Lessons', value: stats.lessons, sub: `${stats.publishedLessons} published`, to: '/lessons', icon: '📖', accent: 'text-secondary' },
            { label: 'Kids', value: stats.kids, to: '/kids', icon: '👦', accent: 'text-accent' },
            { label: 'Topics', value: stats.topics, to: '/topics', icon: '🦕', accent: 'text-success' },
            { label: 'Themes', value: stats.themes, to: '/themes', icon: '🎨', accent: 'text-warning' },
        ]
        : [];

    const quickActions = [
        { to: '/courses/new', label: '+ New Course', icon: '📚' },
        { to: '/lessons/new', label: '+ New Lesson', icon: '📖' },
        { to: '/topics/new', label: '+ New Topic', icon: '🦕' },
        { to: '/themes/new', label: '+ New Theme', icon: '🎨' },
        { to: '/kids/new', label: '+ Add Kid', icon: '👦' },
        { to: '/passwords', label: '+ Password', icon: '🔑' },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="animate-slide-up">
                <p className="text-base-content/50 text-sm font-medium">{getGreeting()} 👋</p>
                <h1 className="text-3xl font-bold font-display tracking-tight mt-0.5">Dashboard</h1>
            </div>

            {/* Stats grid */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <span className="loading loading-spinner loading-lg text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {statCards.map((card, i) => (
                        <Link
                            key={card.label}
                            to={card.to}
                            className={`card bg-base-100 border border-base-300 hover:border-primary hover:shadow-lg
                                        hover:-translate-y-1 transition-all duration-200 animate-slide-up delay-${i + 1}`}
                        >
                            <div className="card-body p-5 gap-2">
                                <span className="text-2xl">{card.icon}</span>
                                <p className={`text-3xl font-bold font-display ${card.accent}`}>{card.value}</p>
                                <div>
                                    <p className="text-sm font-semibold text-base-content/80">{card.label}</p>
                                    {card.sub && <p className="text-xs text-base-content/40 font-medium">{card.sub}</p>}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Quick actions */}
            <div className="card bg-base-100 border border-base-300 animate-slide-up delay-5">
                <div className="card-body p-6 gap-4">
                    <h2 className="font-bold font-display text-base tracking-tight">Quick Actions</h2>
                    <div className="flex flex-wrap gap-2">
                        {quickActions.map((a) => (
                            <Link
                                key={a.to}
                                to={a.to}
                                className="btn btn-sm btn-outline font-medium gap-1.5 hover:btn-primary transition-all"
                            >
                                <span>{a.icon}</span>
                                {a.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
