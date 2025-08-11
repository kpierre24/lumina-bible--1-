
import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDevotionalForVerse } from '../services/geminiService';
import { fetchVerse } from '../services/bibleService';
import { BibleApiResponse } from '../types';
import { DAILY_VERSE_SUGGESTIONS } from '../constants';
import ReactMarkdown from 'react-markdown';

const DevotionalPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [verseData, setVerseData] = useState<BibleApiResponse | null>(null);
    const [devotional, setDevotional] = useState('');

    const dailyVerse = useMemo(() => {
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        return DAILY_VERSE_SUGGESTIONS[dayOfYear % DAILY_VERSE_SUGGESTIONS.length];
    }, []);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedVerse = await fetchVerse(dailyVerse, 'web');
                setVerseData(fetchedVerse);
                
                const generatedDevotional = await getDevotionalForVerse(fetchedVerse.reference, fetchedVerse.text);
                setDevotional(generatedDevotional);

            } catch (err: any) {
                setError(err.message || 'Failed to load devotional content.');
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [dailyVerse]);

    return (
        <div>
            <Header title="Daily Manna" subtitle="Your verse and devotional for today." />
            
            <div className="p-4 max-w-4xl mx-auto space-y-6">
                {loading && <LoadingSpinner />}
                {error && <div className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md text-center">{error}</div>}

                {verseData && (
                     <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg border-l-4 border-secondary">
                        <h2 className="text-2xl font-bold font-serif text-neutral-800 dark:text-neutral-100">{verseData.reference}</h2>
                        <p className="text-lg mt-2 text-neutral-600 dark:text-neutral-300 font-serif leading-relaxed">"{verseData.text.trim()}"</p>
                        <p className="text-right text-sm text-neutral-500 dark:text-neutral-400 mt-2">{verseData.translation_name}</p>
                    </div>
                )}
               
                {devotional && (
                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
                         <h3 className="text-xl font-bold text-primary dark:text-secondary mb-3 flex items-center">
                            <SparklesIcon />
                            Living Word Devotional
                         </h3>
                        <div className="prose prose-lg dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 leading-relaxed">
                             <ReactMarkdown
                                children={devotional}
                                components={{
                                    h1: ({node, ...props}) => <h1 className="text-lg font-bold" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-md font-semibold" {...props} />,
                                    strong: ({node, ...props}) => <strong className="font-semibold text-primary dark:text-secondary" {...props} />
                                }}
                             />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 01-1.414 1.414L12 6.414l-2.293 2.293a1 1 0 01-1.414-1.414L10 4.707M12 21l-2.293-2.293a1 1 0 011.414-1.414L12 17.586l2.293-2.293a1 1 0 011.414 1.414L14 19.293M17 3l-2.293 2.293a1 1 0 01-1.414-1.414L14 2.586l2.293-2.293a1 1 0 011.414 1.414L17 5.293m-4 14l-2.293-2.293a1 1 0 011.414-1.414L12 17.586l2.293-2.293a1 1 0 011.414 1.414L14 19.293" />
    </svg>
);


export default DevotionalPage;