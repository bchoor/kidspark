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
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login(password);
            navigate('/cms/', { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card bg-base-100 shadow-xl w-full max-w-sm">
                <div className="card-body gap-4">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">KidSpark CMS</h1>
                        <p className="text-base-content/60 text-sm mt-1">Admin access</p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <label className="form-control">
                            <div className="label">
                                <span className="label-text">Admin Password</span>
                            </div>
                            <input
                                type="password"
                                className="input input-bordered w-full"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                                required
                            />
                        </label>

                        {error && (
                            <div className="alert alert-error py-2 text-sm">
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={submitting || !password}
                        >
                            {submitting ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
