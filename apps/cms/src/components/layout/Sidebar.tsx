import { NavLink } from 'react-router-dom';

const navItems = [
    { to: '/', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/courses', label: 'Courses', icon: '📚' },
    { to: '/lessons', label: 'Lessons', icon: '📖' },
    { to: '/topics', label: 'Topics', icon: '🦕' },
    { to: '/themes', label: 'Themes', icon: '🎨' },
    { to: '/kids', label: 'Kids', icon: '👦' },
    { to: '/passwords', label: 'Passwords', icon: '🔑' },
];

export function Sidebar() {
    return (
        <aside className="w-64 bg-base-100 min-h-full flex flex-col border-r border-base-200">
            {/* Logo area */}
            <div className="p-4 border-b border-base-200">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <div>
                        <p className="font-bold text-sm leading-tight">KidSpark</p>
                        <p className="text-xs text-base-content/50">Admin CMS</p>
                    </div>
                </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 p-3">
                <ul className="menu menu-sm gap-1 p-0">
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    isActive ? 'active' : ''
                                }
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-3 border-t border-base-200">
                <p className="text-xs text-base-content/40 text-center">KidSpark v0.1</p>
            </div>
        </aside>
    );
}
