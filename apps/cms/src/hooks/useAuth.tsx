import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import { api } from '../lib/api';

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        api.auth
            .check()
            .then((r) => setIsAuthenticated(r.authenticated))
            .catch(() => setIsAuthenticated(false))
            .finally(() => setIsLoading(false));
    }, []);

    const login = useCallback(async (password: string) => {
        setError(null);
        try {
            await api.auth.login(password);
            setIsAuthenticated(true);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Login failed';
            setError(msg);
            throw err;
        }
    }, []);

    const logout = useCallback(async () => {
        await api.auth.logout().catch(() => { });
        setIsAuthenticated(false);
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, error, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthState {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
