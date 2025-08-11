
import { useEffect } from 'react';
import useUserLocalStorage from './useUserLocalStorage';
import { UserPreferences } from '../types';

const defaultPreferences: UserPreferences = {
    defaultTranslation: 'kjv',
    defaultSideBySide: true,
    theme: 'system',
};

export const useUserPreferences = (): [UserPreferences, (prefs: UserPreferences) => void] => {
    const [preferences, setPreferences] = useUserLocalStorage<UserPreferences>(
        'userPreferences',
        defaultPreferences
    );
    
    useEffect(() => {
        const root = window.document.documentElement;
        const isDark =
            preferences.theme === 'dark' ||
            (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        root.classList.remove(isDark ? 'light' : 'dark');
        root.classList.add(isDark ? 'dark' : 'light');

    }, [preferences.theme]);

    // This hook will also return the setter so components can update preferences.
    // If we only wanted to apply the theme, we wouldn't need to return anything.
    return [preferences, setPreferences];
};
