import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../hooks/useSession';
import { api } from '../../lib/api';
import type { Kid } from '@kidspark/shared';

export function PasswordGate() {
    const { isAuthenticated, isLoading } = useSession();
    const navigate = useNavigate();

    // If already authenticated, go straight to courses
    useEffect(() => {
        if (!isLoading && isAuthenticated) navigate('/courses', { replace: true });
    }, [isAuthenticated, isLoading, navigate]);

    const [password, setPassword] = useState('');
    const [kids, setKids] = useState<Kid[]>([]);
    const [step, setStep] = useState<'password' | 'select-kid'>('password');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { verify } = useSession();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    async function handlePasswordSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const list = await api.kids.list();
            setKids(list);
            setStep('select-kid');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    async function handleKidSelect(kid: Kid) {
        setError(null);
        setLoading(true);
        try {
            await verify(password, kid);
            navigate('/courses', { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Incorrect password');
            setStep('password');
            setPassword('');
        } finally {
            setLoading(false);
        }
    }

    if (step === 'select-kid') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/20 to-base-200 p-6 gap-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Who's learning today? 🎉</h1>
                    <p className="text-base-content/60 mt-1">Tap your name to start!</p>
                </div>

                {error && (
                    <div className="alert alert-error max-w-sm">
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    {kids.map((kid) => (
                        <button
                            key={kid.id}
                            onClick={() => handleKidSelect(kid)}
                            disabled={loading}
                            className="card bg-base-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border-2 border-transparent hover:border-primary active:scale-95"
                        >
                            <div className="card-body items-center text-center p-4 gap-2">
                                <span className="text-4xl">{kid.avatar ?? '🦁'}</span>
                                <p className="font-bold text-lg">{kid.name}</p>
                                <p className="text-sm text-base-content/50">Age {kid.age}</p>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setStep('password')}
                    className="btn btn-ghost btn-sm"
                >
                    ← Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/20 to-base-200 p-6 gap-6">
            <div className="text-center">
                <div className="text-6xl mb-3">⚡</div>
                <h1 className="text-4xl font-bold text-primary">KidSpark</h1>
                <p className="text-base-content/60 mt-2">Learning adventures await!</p>
            </div>

            <div className="card bg-base-100 shadow-xl w-full max-w-sm">
                <form onSubmit={handlePasswordSubmit} className="card-body gap-4">
                    <h2 className="text-lg font-semibold text-center">Enter your family password</h2>

                    <input
                        type="password"
                        className="input input-bordered input-lg w-full text-center tracking-widest"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        autoFocus
                        required
                    />

                    {error && (
                        <div className="alert alert-error py-2 text-sm">
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="btn btn-primary btn-lg w-full"
                    >
                        {loading ? (
                            <span className="loading loading-spinner" />
                        ) : (
                            'Let\'s Go! 🚀'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
