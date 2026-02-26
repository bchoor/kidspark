import { Navigate, Outlet, Link } from 'react-router-dom';
import { useSession } from '../../hooks/useSession';
import { useTheme } from '../../hooks/useTheme';

export function LearnLayout() {
    const { isAuthenticated, isLoading, kid, logout } = useSession();
    const { isDark, toggle } = useTheme();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <span className="loading loading-dots loading-lg text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-base-200 flex flex-col">
            {/* Top nav */}
            <nav className="bg-base-100 shadow-sm sticky top-0 z-10 border-b border-base-300">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
                    <Link to="/courses" className="flex items-center gap-2 font-bold text-primary text-xl font-display flex-1">
                        <span className="animate-float inline-block">⚡</span>
                        <span>KidSpark</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {/* Dark mode toggle */}
                        <button
                            onClick={toggle}
                            className="btn btn-ghost btn-sm btn-square"
                            title={isDark ? 'Light mode' : 'Dark mode'}
                        >
                            {isDark ? '☀️' : '🌙'}
                        </button>

                        {kid && (
                            <>
                                <div className="flex items-center gap-2 bg-base-200 rounded-full px-3 py-1">
                                    <span className="text-xl hover-wiggle inline-block cursor-default">{kid.avatar ?? '🦁'}</span>
                                    <span className="font-bold text-sm font-display hidden sm:block">{kid.name}</span>
                                </div>
                                <button
                                    onClick={logout}
                                    className="btn btn-ghost btn-xs text-base-content/50 hover:text-error"
                                >
                                    Sign out
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full">
                <Outlet />
            </main>
        </div>
    );
}
