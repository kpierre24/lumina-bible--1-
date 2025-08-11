
import React from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import useReadingStreak from '../hooks/useReadingStreak';
import { useNavigate } from 'react-router-dom';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { BIBLE_VERSIONS } from '../constants';

const ProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const [streak] = useReadingStreak();
    const [preferences, setPreferences] = useUserPreferences();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        return null; // Should be redirected by ProtectedRoute anyway
    }

    return (
        <div>
            <Header title="My Profile" />
            
            <div className="p-4 max-w-4xl mx-auto space-y-6">
                <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg shadow-sm text-center">
                    <UserCircleIconLarge />
                    <h2 className="text-2xl font-bold mt-4 text-neutral-800 dark:text-neutral-100">
                        {user.username}
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Welcome to your spiritual dashboard.
                    </p>
                </div>
                
                <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">My Stats</h3>
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <FireIcon />
                            <div>
                                <p className="font-bold text-xl text-neutral-700 dark:text-neutral-200">{streak}</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Day Reading Streak</p>
                            </div>
                        </div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-full">
                            {streak > 0 ? 'On Fire!' : 'Start Today!'}
                        </span>
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg shadow-sm space-y-4">
                    <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Settings</h3>
                    
                    {/* Default Translation Setting */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Default Translation</label>
                        <select 
                            value={preferences.defaultTranslation} 
                            onChange={(e) => setPreferences({ ...preferences, defaultTranslation: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {BIBLE_VERSIONS.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Default Side-by-Side Setting */}
                    <div className="flex justify-between items-center">
                        <label htmlFor="side-by-side-toggle" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Default to Side-by-Side View
                        </label>
                        <button
                            id="side-by-side-toggle"
                            onClick={() => setPreferences({ ...preferences, defaultSideBySide: !preferences.defaultSideBySide })}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${preferences.defaultSideBySide ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-600'}`}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${preferences.defaultSideBySide ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    
                    {/* Theme Setting */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Theme</label>
                        <div className="grid grid-cols-3 gap-2">
                            <ThemeButton theme="light" current={preferences.theme} setPrefs={setPreferences} prefs={preferences}>Light</ThemeButton>
                            <ThemeButton theme="dark" current={preferences.theme} setPrefs={setPreferences} prefs={preferences}>Dark</ThemeButton>
                            <ThemeButton theme="system" current={preferences.theme} setPrefs={setPreferences} prefs={preferences}>System</ThemeButton>
                        </div>
                    </div>

                </div>

                <div className="mt-6">
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogoutIcon />
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};


const ThemeButton: React.FC<{ theme: 'light' | 'dark' | 'system', current: string, setPrefs: Function, prefs: any, children: React.ReactNode }> = ({ theme, current, setPrefs, prefs, children }) => {
    const isActive = theme === current;
    return (
        <button
            onClick={() => setPrefs({ ...prefs, theme })}
            className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors border-2 ${
                isActive 
                ? 'bg-primary/20 dark:bg-secondary/20 border-primary dark:border-secondary text-primary dark:text-secondary' 
                : 'bg-neutral-100 dark:bg-neutral-700 border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
            }`}
        >
            {children}
        </button>
    );
};


const UserCircleIconLarge: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-neutral-300 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16.5c2.572 0 4.983.823 6.879 2.223M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
);

const FireIcon = () => (
    <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-full">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45.12l-2.495 4.888c-.11.216-.298.393-.523.492l-5.36 1.44A1 1 0 001.53 10.5l3.88 3.785a1 1 0 00.29.728l-.915 5.337a1 1 0 001.45 1.054l4.795-2.52c.196-.104.43-.104.626 0l4.795 2.52a1 1 0 001.45-1.054l-.915-5.337a1 1 0 00.29-.728l3.88-3.785a1 1 0 00-.435-1.765l-5.36-1.44a1 1 0 00-.523-.492L13.845 2.673a1 1 0 00-1.45-.12z" clipRule="evenodd" />
        </svg>
    </div>
);

const LogoutIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

export default ProfilePage;
