
import React from 'react';

interface HeaderProps {
    title: string;
    subtitle?: string;
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, children }) => {
    return (
        <header className="bg-white dark:bg-neutral-800/50 backdrop-blur-sm shadow-sm p-4 sticky top-0 z-10 relative">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-primary dark:text-secondary">{title}</h1>
                {subtitle && <p className="text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>}
                {children}
            </div>
        </header>
    );
};

export default Header;