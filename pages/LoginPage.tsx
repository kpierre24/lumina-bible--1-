
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

type AuthMode = 'signin' | 'signup';

const LoginPage: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('signin');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const { login, signup, loginWithGoogle, user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        // If user is already logged in, redirect them from the login page
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user, navigate, from]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!username || !password) {
            setError("Username and password are required.");
            return;
        }

        try {
            if (mode === 'signin') {
                await login(username, password);
            } else {
                await signup(username, password);
            }
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-light dark:bg-dark p-4">
            <div className="w-full max-w-sm mx-auto">
                <div className="text-center mb-8">
                     <h1 className="text-4xl font-serif font-bold text-primary dark:text-secondary">
                        Lumina Bible
                    </h1>
                     <p className="text-neutral-500 dark:text-neutral-400 mt-1 font-sans">
                        Welcome back to the Word.
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-2xl shadow-lg">
                    <div className="flex border-b border-neutral-200 dark:border-neutral-700 mb-6">
                        <button onClick={() => setMode('signin')} className={`flex-1 py-2 text-sm font-semibold transition-colors ${mode === 'signin' ? 'text-primary dark:text-secondary border-b-2 border-primary dark:border-secondary' : 'text-neutral-500 dark:text-neutral-400'}`}>
                            Sign In
                        </button>
                        <button onClick={() => setMode('signup')} className={`flex-1 py-2 text-sm font-semibold transition-colors ${mode === 'signup' ? 'text-primary dark:text-secondary border-b-2 border-primary dark:border-secondary' : 'text-neutral-500 dark:text-neutral-400'}`}>
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-300" htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                autoComplete="username"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-300" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                            />
                        </div>
                        
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button type="submit" disabled={loading} className="w-full px-4 py-2.5 bg-primary text-white rounded-md font-semibold hover:bg-primary-dark transition-colors disabled:bg-neutral-400 flex items-center justify-center">
                            {loading ? <LoadingSpinnerSmall /> : (mode === 'signin' ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>
                    
                    <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-neutral-300 dark:border-neutral-600"></div>
                        <span className="flex-shrink mx-4 text-xs text-neutral-400 dark:text-neutral-500">OR</span>
                        <div className="flex-grow border-t border-neutral-300 dark:border-neutral-600"></div>
                    </div>

                    <button onClick={loginWithGoogle} disabled={loading} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 rounded-md font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2">
                        <GoogleIcon />
                        Sign In with Google
                    </button>
                </div>
            </div>
        </div>
    );
};

const LoadingSpinnerSmall = () => <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.641-3.657-11.303-8.653l-6.571 4.819C9.656 39.663 16.318 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.616 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);

export default LoginPage;
