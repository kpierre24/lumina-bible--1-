
import React from 'react';

interface SplashScreenProps {
    isHiding: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isHiding }) => {
    return (
        <div className={`flex items-center justify-center h-screen w-screen bg-light dark:bg-dark transition-opacity duration-500 ease-in-out ${isHiding ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-center animate-pulse">
                <h1 className="text-5xl font-serif font-bold text-primary dark:text-secondary">
                    Lumina Bible
                </h1>
                 <p className="text-neutral-500 dark:text-neutral-400 mt-2 font-sans">
                    Your guide to the Word.
                </p>
            </div>
        </div>
    );
};

export default SplashScreen;
