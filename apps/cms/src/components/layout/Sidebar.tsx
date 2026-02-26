import { NavLink } from 'react-router-dom';

const navItems = [
    { to: '/cms/', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/cms/courses', label: 'Courses', icon: '📚' },
    { to: '/cms/lessons', label: 'Lessons', icon: '📖' },
    { to: '/cms/topics', label: 'Topics', icon: '🦕' },
    { to: '/cms/themes', label: 'Themes', icon: '🎨' },
    { to: '/cms/kids', label: 'Kids', icon: '👦' },
    { to: '/cms/passwords', label: 'Passwords', icon: '🔑' },
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
