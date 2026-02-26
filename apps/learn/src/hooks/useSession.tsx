import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import type { Kid } from '@kidspark/shared';
import { api } from '../lib/api';

interface SessionState {
    isAuthenticated: boolean;
    isLoading: boolean;
    kid: Kid | null;
    verify: (password: string, kid: Kid) => Promise<void>;
    logout: () => Promise<void>;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [kid, setKid] = useState<Kid | null>(null);

    // On mount: check existing session
    useEffect(() => {
        api.auth
            .check()
            .then(async (r) => {
                if (r.authenticated && r.kid_id) {
                    setIsAuthenticated(true);
                    // Load kid list to get kid info
                    const kids = await api.kids.list().catch(() => [] as Kid[]);
                    const found = kids.find((k) => k.id === r.kid_id) ?? null;
                    setKid(found);
                }
            })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, []);

    const verify = useCallback(async (password: string, selectedKid: Kid) => {
        await api.auth.verify(password, selectedKid.id);
        setIsAuthenticated(true);
        setKid(selectedKid);
    }, []);

    const logout = useCallback(async () => {
        await api.auth.logout().catch(() => { });
        setIsAuthenticated(false);
        setKid(null);
    }, []);

    return (
        <SessionContext.Provider value={{ isAuthenticated, isLoading, kid, verify, logout }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession(): SessionState {
    const ctx = useContext(SessionContext);
    if (!ctx) throw new Error('useSession must be used within SessionProvider');
    return ctx;
}
