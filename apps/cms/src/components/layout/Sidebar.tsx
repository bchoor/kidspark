import { NavLink } from 'react-router-dom';

const navItems = [
    { to: '/', label: 'Dashboard', icon: '◆', end: true },
    { to: '/courses', label: 'Courses', icon: '📚' },
    { to: '/lessons', label: 'Lessons', icon: '📖' },
    { to: '/topics', label: 'Topics', icon: '🦕' },
    { to: '/themes', label: 'Themes', icon: '🎨' },
    { to: '/kids', label: 'Kids', icon: '👦' },
    { to: '/passwords', label: 'Passwords', icon: '🔑' },
];

export function Sidebar() {
    return (
        <aside className="w-64 bg-base-100 min-h-full flex flex-col border-r border-base-300">
            {/* Logo area */}
            <div className="px-5 py-5 border-b border-base-300">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-base">⚡</span>
                    </div>
                    <div>
                        <p className="font-bold text-sm font-display leading-tight tracking-tight">KidSpark</p>
                        <p className="text-xs text-base-content/40 font-medium">Admin CMS</p>
                    </div>
                </div>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4">
                <p className="text-xs font-semibold text-base-content/35 uppercase tracking-widest px-3 mb-3">Content</p>
                <ul className="space-y-0.5">
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    `sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                        ? 'sidebar-link-active'
                                        : 'text-base-content/70 hover:text-base-content'
                                    }`
                                }
                            >
                                <span className="text-base w-5 text-center">{item.icon}</span>
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="px-5 py-4 border-t border-base-300">
                <p className="text-xs text-base-content/30 font-medium">KidSpark v0.1 · M5</p>
            </div>
        </aside>
    );
}
