import { Navigate, Outlet, Link } from 'react-router-dom';
import { useSession } from '../../hooks/useSession';

export function LearnLayout() {
    const { isAuthenticated, isLoading, kid, logout } = useSession();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-base-200 flex flex-col">
            {/* Top nav */}
            <nav className="navbar bg-base-100 shadow-sm sticky top-0 z-10 px-4">
                <div className="flex-1">
                    <Link to="/courses" className="flex items-center gap-2 font-bold text-primary text-lg">
                        <span>⚡</span>
                        <span>KidSpark</span>
                    </Link>
                </div>
                {kid && (
                    <div className="flex-none flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{kid.avatar ?? '🦁'}</span>
                            <span className="font-semibold text-sm hidden sm:block">{kid.name}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="btn btn-ghost btn-xs"
                        >
                            Sign out
                        </button>
                    </div>
                )}
            </nav>

            {/* Content */}
            <main className="flex-1 p-4 sm:p-6">
                <Outlet />
            </main>
        </div>
    );
}
