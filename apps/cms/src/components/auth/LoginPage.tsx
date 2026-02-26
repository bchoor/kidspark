import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function LoginPage() {
    const { login, isLoading } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <span className="loading loading-spinner loading-lg text-primary" />
            </div>
        );
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login(password);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden noise-bg"
            style={{ background: 'linear-gradient(135deg, oklch(18% 0.06 278) 0%, oklch(14% 0.04 265) 50%, oklch(16% 0.05 290) 100%)' }}>

            {/* Subtle gradient orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, oklch(55% 0.20 278), transparent)' }} />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, oklch(62% 0.17 162), transparent)' }} />

            <div className="relative z-10 w-full max-w-sm px-4 animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                        style={{ background: 'oklch(55% 0.20 278)' }}>
                        <span className="text-2xl">⚡</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white font-display tracking-tight">KidSpark CMS</h1>
                    <p className="text-white/50 mt-1 text-sm">Admin access</p>
                </div>

                {/* Card */}
                <div className="card bg-base-100/10 backdrop-blur-xl border border-white/10 shadow-2xl">
                    <form onSubmit={handleSubmit} className="card-body gap-4 p-7">
                        <label className="form-control">
                            <div className="label pb-1">
                                <span className="label-text text-white/70 text-sm font-medium">Admin Password</span>
                            </div>
                            <input
                                type="password"
                                className="input input-bordered w-full bg-white/10 border-white/20 text-white placeholder-white/30 focus:border-primary focus:bg-white/15"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                                required
                            />
                        </label>

                        {error && (
                            <div className="alert alert-error py-2 text-sm animate-scale-in">
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary w-full font-display font-semibold mt-1"
                            disabled={submitting || !password}
                        >
                            {submitting
                                ? <span className="loading loading-spinner loading-sm" />
                                : 'Sign In →'
                            }
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
