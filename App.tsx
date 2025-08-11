
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import ReadPage from './pages/ReadPage';
import DevotionalPage from './pages/DevotionalPage';
import JournalPage from './pages/JournalPage';
import ReadingPlansPage from './pages/ReadingPlansPage';
import AskLearnPage from './pages/AskLearnPage';
import SplashScreen from './components/SplashScreen';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { useUserPreferences } from './hooks/useUserPreferences';

const App: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [isHiding, setIsHiding] = useState(false);

    // Hook to manage and apply user's theme preferences
    useUserPreferences();

    useEffect(() => {
        // This effect handles the initial app splash screen.
        // It runs independently of the auth loading state.
        const fadeOutTimer = setTimeout(() => {
            setIsHiding(true);
        }, 1500);

        const loadingTimer = setTimeout(() => {
            setIsAppLoading(false);
        }, 2000);

        // Register Service Worker for offline capabilities
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('Service Worker registered successfully:', registration);
                    })
                    .catch(err => {
                        console.error('Service Worker registration failed:', err);
                    });
            });
        }

        return () => {
            clearTimeout(fadeOutTimer);
            clearTimeout(loadingTimer);
        };
    }, []);

    // Show splash screen if either the app or auth is still loading.
    if (isAppLoading || authLoading) {
        return <SplashScreen isHiding={isHiding && !authLoading} />;
    }

    const userKey = user?.id || 'guest';

    return (
        <div className="flex flex-col h-screen font-sans bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 animate-fade-in">
            <main className="flex-grow overflow-y-auto pb-20">
                <Routes>
                    {/* Publicly accessible routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={user ? <DevotionalPage key={userKey} /> : <Navigate to="/login" />} />
                    <Route path="/read" element={<ReadPage key={userKey} />} />
                    
                    {/* Protected Routes */}
                    <Route path="/learn" element={<ProtectedRoute><AskLearnPage key={userKey} /></ProtectedRoute>} />
                    <Route path="/plans" element={<ProtectedRoute><ReadingPlansPage key={userKey} /></ProtectedRoute>} />
                    <Route path="/journal" element={<ProtectedRoute><JournalPage key={userKey} /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage key={userKey} /></ProtectedRoute>} />
                    
                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
                </Routes>
            </main>
            {user && <BottomNav />}
        </div>
    );
};

export default App;