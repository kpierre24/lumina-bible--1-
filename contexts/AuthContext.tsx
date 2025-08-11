
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

// This is a MOCK authentication setup for demonstration purposes.
// In a real application, this would involve secure API calls to a backend server.

interface User {
    id: string;
    username: string;
}

interface MockUser extends User {
    passwordHash: string; // In a real app, never store plain text passwords
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    signup: (username: string, password: string) => Promise<void>;
    logout: () => void;
    loginWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_DB_KEY = '_lumina_users';
const SESSION_KEY = '_lumina_session';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useLocalStorage<MockUser[]>(USERS_DB_KEY, []);
    const [sessionUserId, setSessionUserId] = useLocalStorage<string | null>(SESSION_KEY, null);

    useEffect(() => {
        // On initial load, check for a persisted session
        setLoading(true);
        if (sessionUserId) {
            const loggedInUser = users.find(u => u.id === sessionUserId);
            if (loggedInUser) {
                setUser({ id: loggedInUser.id, username: loggedInUser.username });
            } else {
                // Session data is stale, clear it
                setSessionUserId(null);
            }
        }
        setLoading(false);
    }, []); // Run only once on mount

    const login = async (username: string, password: string): Promise<void> => {
        setLoading(true);
        // Simulate network delay
        await new Promise(res => setTimeout(res, 500));
        
        const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        // In a real app, you would compare a securely hashed password.
        // This is a simplified check for demonstration.
        if (foundUser && foundUser.passwordHash === password) {
            setUser({ id: foundUser.id, username: foundUser.username });
            setSessionUserId(foundUser.id);
        } else {
            setLoading(false);
            throw new Error('Invalid username or password');
        }
        setLoading(false);
    };

    const signup = async (username: string, password: string): Promise<void> => {
        setLoading(true);
        await new Promise(res => setTimeout(res, 500));
        
        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            setLoading(false);
            throw new Error('Username is already taken');
        }

        const newUser: MockUser = {
            id: `user_${Date.now()}`,
            username,
            passwordHash: password, // Store password directly for this mock setup
        };
        
        setUsers([...users, newUser]);
        setUser({ id: newUser.id, username: newUser.username });
        setSessionUserId(newUser.id);
        setLoading(false);
    };

    const loginWithGoogle = () => {
        // This is a simulation of a Google login.
        setLoading(true);
        const googleUser: User = {
            id: 'google_user_01',
            username: 'Google User',
        };
        setUser(googleUser);
        setSessionUserId(googleUser.id);
        setLoading(false);
    };

    const logout = () => {
        setUser(null);
        setSessionUserId(null);
    };

    const value = { user, loading, login, signup, logout, loginWithGoogle };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
