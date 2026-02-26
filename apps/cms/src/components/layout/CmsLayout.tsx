import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Sidebar } from './Sidebar';

export function CmsLayout() {
    const { isAuthenticated, isLoading, logout } = useAuth();
    const { isDark, toggle } = useTheme();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="drawer lg:drawer-open min-h-screen">
            <input id="cms-drawer" type="checkbox" className="drawer-toggle" />

            {/* Page content */}
            <div className="drawer-content flex flex-col">
                {/* Navbar */}
                <nav className="navbar bg-base-100 border-b border-base-200 sticky top-0 z-10">
                    <div className="flex-none lg:hidden">
                        <label htmlFor="cms-drawer" className="btn btn-ghost btn-square">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-5 w-5 stroke-current">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </label>
                    </div>
                    <div className="flex-1">
                        <span className="text-lg font-semibold">KidSpark CMS</span>
                    </div>
                    <div className="flex-none gap-2">
                        <button
                            onClick={toggle}
                            className="btn btn-ghost btn-sm btn-square"
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? '☀️' : '🌙'}
                        </button>
                        <button
                            onClick={logout}
                            className="btn btn-ghost btn-sm"
                        >
                            Sign out
                        </button>
                    </div>
                </nav>

                {/* Main content area */}
                <main className="flex-1 p-6 bg-base-200 min-h-[calc(100vh-4rem)]">
                    <Outlet />
                </main>
            </div>

            {/* Sidebar */}
            <div className="drawer-side z-20">
                <label htmlFor="cms-drawer" className="drawer-overlay" />
                <Sidebar />
            </div>
        </div>
    );
}
