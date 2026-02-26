import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

function getInitial(): Theme {
    try {
        return (localStorage.getItem('learn-theme') as Theme) ?? 'light';
    } catch {
        return 'light';
    }
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(getInitial);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem('learn-theme', theme); } catch { }
    }, [theme]);

    const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

    return { theme, toggle, isDark: theme === 'dark' };
}
