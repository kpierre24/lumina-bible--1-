
import React, { useState, useCallback, useEffect } from 'react';
import Header from '../components/Header';
import { BIBLE_VERSIONS } from '../constants';
import { fetchVerse } from '../services/bibleService';
import { getSermonOutline } from '../services/geminiService';
import { BibleApiResponse, Verse, Bookmark } from '../types';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useOfflineManager, DownloadStatus, Progress } from '../hooks/useOfflineManager';
import { useUserPreferences } from '../hooks/useUserPreferences';
import useUserLocalStorage from '../hooks/useUserLocalStorage';
import LoadingSpinner from '../components/LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';

const ReadPage: React.FC = () => {
    const [preferences] = useUserPreferences();
    
    const [query, setQuery] = useState('John 3:16-17');
    const [translation1, setTranslation1] = useState(() => preferences.defaultTranslation || 'kjv');
    const [translation2, setTranslation2] = useState('web');
    const [sideBySide, setSideBySide] = useState(() => preferences.defaultSideBySide ?? true);
    const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verseData1, setVerseData1] = useState<BibleApiResponse | null>(null);
    const [verseData2, setVerseData2] = useState<BibleApiResponse | null>(null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [outline, setOutline] = useState<string | null>(null);
    const [outlineError, setOutlineError] = useState<string | null>(null);
    
    const [bookmarks, setBookmarks] = useUserLocalStorage<Bookmark[]>('bookmarks', []);
    const { user } = useAuth();

    const { speak, pause, resume, cancel, isSpeaking, isPaused, highlightedVerseIndex } = useTextToSpeech();
    const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);

    const handleSearch = useCallback(async (shouldClearOutline = true) => {
        cancel();
        setActiveSpeakerId(null);
        if (!query) {
            setError("Please enter a scripture reference.");
            return;
        }
        setLoading(true);
        setError(null);
        setVerseData1(null);
        setVerseData2(null);
        if (shouldClearOutline) {
            setOutline(null);
            setOutlineError(null);
        }

        try {
            const data1Promise = fetchVerse(query, translation1);
            let data2Promise = null;
            if (sideBySide) {
                data2Promise = fetchVerse(query, translation2);
                const [res1, res2] = await Promise.all([data1Promise, data2Promise]);
                setVerseData1(res1);
                setVerseData2(res2);
            } else {
                setVerseData1(await data1Promise);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch scripture. Please check the reference and try again.');
        } finally {
            setLoading(false);
        }
    }, [query, translation1, translation2, sideBySide, cancel]);
    
    useEffect(() => {
        handleSearch(false);
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePlayAudio = (data: BibleApiResponse) => {
        const id = data.translation_id;
        if (isSpeaking && activeSpeakerId === id) {
            if (isPaused) {
                resume();
            } else {
                pause();
            }
        } else {
            if (isSpeaking) {
                cancel();
            }

            let combinedText = '';
            const verseOffsets: number[] = [];
            data.verses.forEach(verse => {
                verseOffsets.push(combinedText.length);
                const verseText = `Verse ${verse.verse}. ${verse.text.trim()} `;
                combinedText += verseText;
            });

            setActiveSpeakerId(id);
            speak({
                text: combinedText,
                verseOffsets,
                onEnd: () => {
                    setActiveSpeakerId(null);
                },
            });
        }
    };

    const handleGenerateOutline = async () => {
        if (!verseData1 || isGenerating) return;
        if (!user) {
            setOutlineError("Please log in to use AI features.");
            return;
        }

        setIsGenerating(true);
        setOutline(null);
        setOutlineError(null);
        try {
            const result = await getSermonOutline(verseData1.reference, verseData1.text);
            setOutline(result);
        } catch (err: any) {
            setOutlineError(err.message || "An unexpected error occurred.");
        } finally {
            setIsGenerating(false);
        }
    };

    const generateBookmarkId = (verse: Verse, translation: string) => {
        return `${verse.book_name.toLowerCase().replace(/ /g, '-')}-${verse.chapter}-${verse.verse}-${translation}`;
    };

    const toggleBookmark = (verse: Verse, translationName: string, translationId: string) => {
        if (!user) {
            // Optionally, prompt the user to log in
            alert("Please log in to save bookmarks.");
            return;
        }
        const id = generateBookmarkId(verse, translationId);
        const existingBookmark = bookmarks.find(b => b.id === id);

        if (existingBookmark) {
            setBookmarks(bookmarks.filter(b => b.id !== id));
        } else {
            const newBookmark: Bookmark = {
                id,
                reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`,
                text: verse.text,
                translation: translationName,
                notes: [],
                createdAt: new Date().toISOString(),
            };
            setBookmarks([newBookmark, ...bookmarks]);
        }
    };


    return (
        <div>
            <Header title="Read Scripture" subtitle="Search passages and compare translations." />
            
            <div className="p-4 max-w-4xl mx-auto space-y-4">
                <div className="bg-white dark:bg-neutral-800/50 p-4 rounded-lg shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="e.g., Genesis 1:1 or Romans 8"
                            className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button onClick={() => handleSearch()} disabled={loading} className="px-4 py-2 bg-primary text-white rounded-md font-semibold hover:bg-primary-dark transition-colors w-full sm:w-auto disabled:bg-neutral-400">
                            {loading ? '...' : 'Search'}
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                         <label className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-300">
                             <input type="checkbox" checked={sideBySide} onChange={(e) => setSideBySide(e.target.checked)} className="rounded text-primary focus:ring-primary"/>
                             <span>Side-by-Side</span>
                         </label>
                         <button onClick={() => setIsOfflineModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary dark:text-secondary bg-primary/10 dark:bg-secondary/10 rounded-md hover:bg-primary/20 dark:hover:bg-secondary/20 transition-colors">
                            <DownloadCloudIcon />
                            Manage Offline
                         </button>
                    </div>

                    <div className={`grid gap-4 ${sideBySide ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                        <TranslationSelector version={translation1} setVersion={setTranslation1} />
                        {sideBySide && <TranslationSelector version={translation2} setVersion={setTranslation2} />}
                    </div>
                </div>

                {loading && <LoadingSpinner />}
                {error && <div className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md text-center">{error}</div>}
                
                <div className={`grid gap-6 ${sideBySide ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                    {verseData1 && <VerseDisplay data={verseData1} bookmarks={bookmarks} toggleBookmark={toggleBookmark} generateBookmarkId={generateBookmarkId} onPlay={handlePlayAudio} isPlaying={activeSpeakerId === verseData1.translation_id} isPaused={activeSpeakerId === verseData1.translation_id && isPaused} highlightedVerseIndex={activeSpeakerId === verseData1.translation_id ? highlightedVerseIndex : null} />}
                    {sideBySide && verseData2 && <VerseDisplay data={verseData2} bookmarks={bookmarks} toggleBookmark={toggleBookmark} generateBookmarkId={generateBookmarkId} onPlay={handlePlayAudio} isPlaying={activeSpeakerId === verseData2.translation_id} isPaused={activeSpeakerId === verseData2.translation_id && isPaused} highlightedVerseIndex={activeSpeakerId === verseData2.translation_id ? highlightedVerseIndex : null} />}
                </div>

                {verseData1 && !loading && (
                    <div className="bg-white dark:bg-neutral-800/50 p-4 rounded-lg shadow-sm mt-6">
                        <button 
                            onClick={handleGenerateOutline} 
                            disabled={isGenerating || !user}
                            className="w-full px-4 py-2 bg-secondary text-primary-dark rounded-md font-semibold hover:bg-amber-300 transition-colors disabled:bg-neutral-300 dark:disabled:bg-neutral-600 flex items-center justify-center gap-2"
                        >
                            <SparklesIcon />
                            {isGenerating ? 'Generating...' : (user ? 'Generate Study Outline' : 'Log in to Generate Outline')}
                        </button>

                        {isGenerating && <div className="pt-4"><LoadingSpinner /></div>}
                        {outlineError && <div className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md text-center mt-4">{outlineError}</div>}
                        {outline && <OutlineDisplay content={outline} />}
                    </div>
                )}
            </div>
            {isOfflineModalOpen && <OfflineManagerModal onClose={() => setIsOfflineModalOpen(false)} />}
        </div>
    );
};

const TranslationSelector: React.FC<{ version: string; setVersion: (v: string) => void; }> = ({ version, setVersion }) => (
    <select 
        value={version} 
        onChange={(e) => setVersion(e.target.value)}
        className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
    >
        {BIBLE_VERSIONS.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
        ))}
    </select>
);

interface VerseDisplayProps {
    data: BibleApiResponse;
    bookmarks: Bookmark[];
    toggleBookmark: (verse: Verse, translationName: string, translationId: string) => void;
    generateBookmarkId: (verse: Verse, translation: string) => string;
    onPlay: (data: BibleApiResponse) => void;
    isPlaying: boolean;
    isPaused: boolean;
    highlightedVerseIndex: number | null;
}

const VerseDisplay: React.FC<VerseDisplayProps> = ({ data, bookmarks, toggleBookmark, generateBookmarkId, onPlay, isPlaying, isPaused, highlightedVerseIndex }) => (
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm font-serif">
        <div className="flex justify-between items-center mb-4">
            <div>
                 <h3 className="text-xl font-semibold text-primary dark:text-secondary">{data.reference}</h3>
                 <h4 className="text-sm text-neutral-500 dark:text-neutral-400 font-sans">{data.translation_name}</h4>
            </div>
            <button
                onClick={() => onPlay(data)}
                className="p-2 rounded-full text-primary dark:text-secondary hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                aria-label={isPlaying ? (isPaused ? 'Resume audio' : 'Pause audio') : 'Listen to passage'}
            >
                {isPlaying ? (isPaused ? <PlayIcon /> : <PauseIcon />) : <SpeakerIcon />}
            </button>
        </div>
        <div className="space-y-4 text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {data.verses.map((v, index) => {
                const bookmarkId = generateBookmarkId(v, data.translation_id);
                const isBookmarked = bookmarks.some(b => b.id === bookmarkId);
                const isHighlighted = highlightedVerseIndex === index;
                return (
                    <div key={v.verse} className={`flex gap-3 items-start group transition-colors duration-300 p-2 -m-2 rounded-lg ${isHighlighted ? 'bg-secondary/20 dark:bg-secondary/10' : ''}`}>
                        <div className="flex-shrink-0 pt-1">
                            <sup className="font-sans font-bold text-primary dark:text-secondary">{v.verse}</sup>
                        </div>
                        <p className="flex-grow">{v.text.trim()}</p>
                        <button 
                            onClick={() => toggleBookmark(v, data.translation_name, data.translation_id)}
                            className="flex-shrink-0 text-secondary opacity-20 group-hover:opacity-100 transition-opacity pt-1"
                            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                        >
                            <BookmarkIcon isFilled={isBookmarked} />
                        </button>
                    </div>
                );
            })}
        </div>
    </div>
);


const OutlineDisplay: React.FC<{ content: string }> = ({ content }) => (
    <div className="mt-4 p-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="prose prose-lg dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 leading-relaxed">
             <ReactMarkdown
                children={content}
                components={{
                    h1: ({node, ...props}) => <h1 className="text-lg font-bold !text-primary dark:!text-secondary" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-md font-semibold !text-primary dark:!text-secondary" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-md font-semibold" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-primary dark:text-secondary" {...props} />
                }}
             />
        </div>
    </div>
);

const OfflineManagerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { statuses, progress, downloadTranslation, deleteTranslation, cancelDownload } = useOfflineManager();

    const getStatusText = (status: DownloadStatus | undefined, p: Progress | undefined) => {
        switch (status) {
            case 'downloaded': return <span className="text-green-600 dark:text-green-400">Downloaded</span>;
            case 'downloading': return <span className="text-blue-600 dark:text-blue-400">Downloading... {p?.percentage || 0}%</span>;
            case 'error': return <span className="text-red-600 dark:text-red-400">Error</span>;
            default: return <span className="text-neutral-500 dark:text-neutral-400">Not Downloaded</span>;
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl w-full max-w-md m-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-primary dark:text-secondary">Manage Offline Translations</h2>
                     <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>
                <div className="p-4 overflow-y-auto space-y-3">
                    <div className="text-sm p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md">
                        Download the New Testament for a translation to read it anywhere, without an internet connection.
                    </div>
                    {BIBLE_VERSIONS.map(version => {
                        const status = statuses[version.id];
                        const currentProgress = progress[version.id];
                        return (
                            <div key={version.id} className="bg-neutral-100 dark:bg-neutral-900/50 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-neutral-800 dark:text-neutral-100">{version.name}</p>
                                        <p className="text-sm">{getStatusText(status, currentProgress)}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {status === 'downloading' ? (
                                             <button onClick={() => cancelDownload(version.id)} className="px-3 py-1 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600">Cancel</button>
                                        ) : status === 'downloaded' ? (
                                             <button onClick={() => deleteTranslation(version.id)} className="px-3 py-1 text-sm font-medium bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900">Delete</button>
                                        ) : (
                                             <button onClick={() => downloadTranslation(version.id)} className="px-3 py-1 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-dark">Download</button>
                                        )}
                                    </div>
                                </div>
                                {status === 'downloading' && currentProgress && (
                                     <div className="mt-2">
                                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
                                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${currentProgress.percentage}%` }}></div>
                                        </div>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-right mt-1">{currentProgress.details}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};


const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.586l-1.293 1.293a1 1 0 101.414 1.414L5 6.414V8a1 1 0 002 0V6.414l.293.293a1 1 0 101.414-1.414L7 4.586V3a1 1 0 00-2 0V2zM15 2a1 1 0 00-1 1v1.586l-1.293 1.293a1 1 0 101.414 1.414L15 6.414V8a1 1 0 002 0V6.414l.293.293a1 1 0 001.414-1.414L17 4.586V3a1 1 0 00-2 0V2zM5 10a1 1 0 00-1 1v1.586l-1.293 1.293a1 1 0 101.414 1.414L5 14.414V16a1 1 0 002 0v-1.586l.293.293a1 1 0 101.414-1.414L7 12.586V11a1 1 0 00-2 0v-1zM15 10a1 1 0 00-1 1v1.586l-1.293 1.293a1 1 0 101.414 1.414L15 14.414V16a1 1 0 002 0v-1.586l.293.293a1 1 0 101.414-1.414L17 12.586V11a1 1 0 00-2 0v-1z" clipRule="evenodd" />
    </svg>
);

const BookmarkIcon: React.FC<{isFilled: boolean}> = ({ isFilled }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill={isFilled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v12l-5-2.5L5 16V4z" />
        </svg>
    )
};

const SpeakerIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
);

const PauseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-6-13.5v13.5" />
    </svg>
);

const PlayIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
);

const DownloadCloudIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
);

export default ReadPage;
