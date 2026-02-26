import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../../hooks/useSession';
import { api } from '../../lib/api';
import type { Kid } from '@kidspark/shared';

export function PasswordGate() {
    const { isAuthenticated, isLoading } = useSession();
    const navigate = useNavigate();

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
            <div className="min-h-screen flex items-center justify-center bg-base-200 bg-shapes">
                <span className="loading loading-dots loading-lg text-primary" />
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
            <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 bg-shapes p-6 gap-8 relative overflow-hidden">
                <div className="text-center animate-bounce-in relative z-10">
                    <div className="text-5xl mb-2 animate-float">🎉</div>
                    <h1 className="text-4xl font-bold font-display text-base-content">Who's learning today?</h1>
                    <p className="text-base-content/60 mt-2 font-medium">Tap your name to start your adventure!</p>
                </div>

                {error && (
                    <div className="alert alert-error max-w-sm animate-bounce-in relative z-10">
                        <span>⚠️ {error}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 w-full max-w-md relative z-10">
                    {kids.map((kid, i) => (
                        <button
                            key={kid.id}
                            onClick={() => handleKidSelect(kid)}
                            disabled={loading}
                            className={`card bg-base-100 shadow-xl cursor-pointer border-3 border-transparent
                                        hover:border-primary hover:shadow-2xl hover:-translate-y-2
                                        active:scale-95 transition-all duration-200 animate-bounce-in delay-${i + 1}`}
                        >
                            <div className="card-body items-center text-center p-6 gap-3">
                                <span className="text-5xl hover-wiggle inline-block">{kid.avatar ?? '🦁'}</span>
                                <p className="font-bold text-xl font-display">{kid.name}</p>
                                <span className="badge badge-primary badge-sm">Age {kid.age}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setStep('password')}
                    className="btn btn-ghost btn-sm relative z-10"
                >
                    ← Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 bg-shapes p-6 gap-8 relative overflow-hidden">
            {/* Floating decorations */}
            <div className="absolute top-10 left-10 text-5xl opacity-20 animate-float" style={{ animationDelay: '0s' }}>🦕</div>
            <div className="absolute top-20 right-16 text-4xl opacity-20 animate-float" style={{ animationDelay: '1.5s' }}>⭐</div>
            <div className="absolute bottom-20 left-20 text-4xl opacity-20 animate-float" style={{ animationDelay: '3s' }}>🌈</div>
            <div className="absolute bottom-10 right-10 text-5xl opacity-20 animate-float" style={{ animationDelay: '0.8s' }}>🚀</div>

            {/* Logo */}
            <div className="text-center animate-bounce-in relative z-10">
                <div className="text-7xl mb-3 animate-float">⚡</div>
                <h1 className="text-5xl font-bold font-display text-primary">KidSpark</h1>
                <p className="text-base-content/60 mt-2 font-medium text-lg">Learning adventures await!</p>
            </div>

            {/* Password card */}
            <div className="card bg-base-100 shadow-2xl w-full max-w-sm animate-fade-up relative z-10 border border-base-300">
                <form onSubmit={handlePasswordSubmit} className="card-body gap-5 p-8">
                    <h2 className="text-xl font-bold font-display text-center">Enter your family password</h2>

                    <input
                        type="password"
                        className="input input-bordered input-lg w-full text-center tracking-widest text-2xl"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoFocus
                        required
                    />

                    {error && (
                        <div className="alert alert-error py-2 text-sm animate-bounce-in">
                            <span>⚠️ {error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="btn btn-primary btn-lg w-full text-lg font-bold font-display"
                    >
                        {loading
                            ? <span className="loading loading-dots" />
                            : "Let's Go! 🚀"
                        }
                    </button>
                </form>
            </div>
        </div>
    );
}
