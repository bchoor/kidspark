import { useState, useEffect } from 'react';

type Theme = 'corporate' | 'business';

function getInitial(): Theme {
    try {
        return (localStorage.getItem('cms-theme') as Theme) ?? 'corporate';
    } catch {
        return 'corporate';
    }
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(getInitial);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem('cms-theme', theme); } catch { }
    }, [theme]);

    const toggle = () => setTheme((t) => (t === 'corporate' ? 'business' : 'corporate'));

    return { theme, toggle, isDark: theme === 'business' };
}
