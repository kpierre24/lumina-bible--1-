
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import useUserLocalStorage from '../hooks/useUserLocalStorage';
import { Prayer, Bookmark } from '../types';
import { getVerseForPrayer } from '../services/geminiService';
import { fetchVerse } from '../services/bibleService';
import { useAuth } from '../contexts/AuthContext';

type ActiveTab = 'prayers' | 'bookmarks';

const JournalPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('prayers');

    return (
        <div className="min-h-screen">
            <Header title="My Journal" subtitle="Prayers, notes, and reflections." />
            
            <div className="p-4 max-w-4xl mx-auto">
                <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex space-x-4" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('prayers')}
                            className={`${
                                activeTab === 'prayers'
                                    ? 'border-primary dark:border-secondary text-primary dark:text-secondary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                        >
                            Prayers
                        </button>
                        <button
                            onClick={() => setActiveTab('bookmarks')}
                             className={`${
                                activeTab === 'bookmarks'
                                    ? 'border-primary dark:border-secondary text-primary dark:text-secondary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
                        >
                            Bookmarks & Notes
                        </button>
                    </nav>
                </div>

                {activeTab === 'prayers' ? <PrayerJournalContent /> : <BookmarksContent />}
            </div>
        </div>
    );
};


const PrayerJournalContent: React.FC = () => {
    const [prayers, setPrayers] = useUserLocalStorage<Prayer[]>('prayerJournal', []);
    const [newRequest, setNewRequest] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestionError, setSuggestionError] = useState<string | null>(null);
    const [suggestedVerse, setSuggestedVerse] = useState<{ reference: string; text: string } | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        setSuggestedVerse(null);
        setSuggestionError(null);
    }, [newRequest]);

    const handleSuggestVerse = async () => {
        if (!newRequest.trim() || isSuggesting || !user) return;
        setIsSuggesting(true);
        setSuggestionError(null);
        setSuggestedVerse(null);
        try {
            const verseReference = await getVerseForPrayer(newRequest);
            if (!verseReference) throw new Error("Could not find a suitable verse.");
            const verseData = await fetchVerse(verseReference, 'web');
            setSuggestedVerse({ reference: verseData.reference, text: verseData.text });
        } catch (err: any) {
            setSuggestionError(err.message || "Failed to suggest a verse.");
        } finally {
            setIsSuggesting(false);
        }
    };

    const addPrayer = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRequest.trim()) {
            const newPrayer: Prayer = {
                id: new Date().toISOString(),
                request: newRequest.trim(),
                date: new Date().toLocaleDateString(),
                isAnswered: false,
                scripture: suggestedVerse?.reference,
            };
            setPrayers([newPrayer, ...prayers]);
            setNewRequest('');
            setSuggestedVerse(null);
        }
    };

    const toggleAnswered = (id: string) => {
        setPrayers(prayers.map(p => p.id === id ? { ...p, isAnswered: !p.isAnswered } : p));
    };

    const deletePrayer = (id: string) => {
        setPrayers(prayers.filter(p => p.id !== id));
    };

     return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800/50 p-4 rounded-lg shadow-sm space-y-3">
                <form onSubmit={addPrayer} className="space-y-3">
                    <textarea value={newRequest} onChange={(e) => setNewRequest(e.target.value)} placeholder="What's on your heart?" rows={3} className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button type="button" onClick={handleSuggestVerse} disabled={!newRequest.trim() || isSuggesting} className="w-full sm:w-1/2 px-4 py-2 bg-secondary text-primary-dark rounded-md font-semibold hover:bg-amber-400 transition-colors disabled:bg-neutral-300 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {isSuggesting ? <LoadingSpinnerSmall /> : <SparklesIcon />}
                            {isSuggesting ? 'Finding Verse...' : 'Suggest a Verse'}
                        </button>
                        <button type="submit" className="w-full sm:w-1/2 px-4 py-2 bg-primary text-white rounded-md font-semibold hover:bg-primary-dark transition-colors">Add Prayer</button>
                    </div>
                </form>
                {suggestionError && <div className="text-red-500 text-sm p-2 text-center">{suggestionError}</div>}
                {suggestedVerse && (
                    <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg border-l-4 border-primary dark:border-secondary transition-all animate-fade-in">
                        <p className="font-semibold text-primary dark:text-secondary">{suggestedVerse.reference}</p>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">"{suggestedVerse.text.trim()}"</p>
                    </div>
                )}
            </div>
            <div className="space-y-4">
                {prayers.length === 0 ? (
                    <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">Your prayer journal is empty.</p>
                ) : (
                    prayers.map(prayer => (
                        <div key={prayer.id} className={`bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm transition-opacity ${prayer.isAnswered ? 'opacity-60' : ''}`}>
                            <p className={`text-neutral-700 dark:text-neutral-300 ${prayer.isAnswered ? 'line-through' : ''}`}>{prayer.request}</p>
                            {prayer.scripture && (
                                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                                    <p className="text-sm font-semibold text-primary dark:text-secondary flex items-center gap-2"><BookmarkIcon /> {prayer.scripture}</p>
                                </div>
                            )}
                            <div className="flex justify-between items-center mt-3">
                                <span className="text-xs text-neutral-400 dark:text-neutral-500">{prayer.date}</span>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => toggleAnswered(prayer.id)} className={`text-sm font-semibold ${prayer.isAnswered ? 'text-yellow-500' : 'text-green-500'}`}>{prayer.isAnswered ? 'Unmark' : 'Answered!'}</button>
                                    <button onClick={() => deletePrayer(prayer.id)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const BookmarksContent: React.FC = () => {
    const [bookmarks, setBookmarks] = useUserLocalStorage<Bookmark[]>('bookmarks', []);
    const [newNotes, setNewNotes] = useState<Record<string, string>>({});

    const addNote = (bookmarkId: string) => {
        const noteText = newNotes[bookmarkId]?.trim();
        if (!noteText) return;

        setBookmarks(bookmarks.map(bm => {
            if (bm.id === bookmarkId) {
                return { ...bm, notes: [...bm.notes, noteText] };
            }
            return bm;
        }));
        setNewNotes({ ...newNotes, [bookmarkId]: '' }); // Clear input
    };
    
    const deleteNote = (bookmarkId: string, noteIndex: number) => {
        setBookmarks(bookmarks.map(bm => {
            if (bm.id === bookmarkId) {
                return { ...bm, notes: bm.notes.filter((_, i) => i !== noteIndex) };
            }
            return bm;
        }));
    };

    const deleteBookmark = (bookmarkId: string) => {
        setBookmarks(bookmarks.filter(bm => bm.id !== bookmarkId));
    };

    return (
        <div className="space-y-4">
            {bookmarks.length === 0 ? (
                 <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">You haven't bookmarked any verses yet. Go to the "Read" page to start!</p>
            ) : (
                bookmarks.map(bookmark => (
                    <div key={bookmark.id} className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-lg font-bold text-primary dark:text-secondary font-serif">{bookmark.reference}</h3>
                                <p className="text-xs text-neutral-400 dark:text-neutral-500">{bookmark.translation}</p>
                            </div>
                            <button onClick={() => deleteBookmark(bookmark.id)} className="text-red-500 hover:text-red-700"><TrashIcon /></button>
                        </div>

                        <blockquote className="border-l-4 border-neutral-200 dark:border-neutral-700 pl-4 text-neutral-600 dark:text-neutral-300 italic">
                            "{bookmark.text}"
                        </blockquote>

                        <div className="space-y-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                            <h4 className="font-semibold text-neutral-700 dark:text-neutral-200">My Notes</h4>
                            {bookmark.notes.map((note, index) => (
                                <div key={index} className="flex justify-between items-start bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-md">
                                    <p className="text-sm text-neutral-600 dark:text-neutral-300 flex-grow">{note}</p>
                                    <button onClick={() => deleteNote(bookmark.id, index)} className="text-red-500 hover:text-red-700 ml-2"><TrashIcon size="small" /></button>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Add a new note..."
                                    value={newNotes[bookmark.id] || ''}
                                    onChange={(e) => setNewNotes({...newNotes, [bookmark.id]: e.target.value})}
                                    onKeyDown={(e) => e.key === 'Enter' && addNote(bookmark.id)}
                                    className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button onClick={() => addNote(bookmark.id)} className="px-4 py-2 bg-primary text-white rounded-md font-semibold hover:bg-primary-dark transition-colors">Add</button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};


// --- Helper Components & Icons ---
const SparklesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.586l-1.293 1.293a1 1 0 101.414 1.414L5 6.414V8a1 1 0 002 0V6.414l.293.293a1 1 0 101.414-1.414L7 4.586V3a1 1 0 00-2 0V2zM15 2a1 1 0 00-1 1v1.586l-1.293 1.293a1 1 0 101.414 1.414L15 6.414V8a1 1 0 002 0V6.414l.293.293a1 1 0 001.414-1.414L17 4.586V3a1 1 0 00-2 0V2zM5 10a1 1 0 00-1 1v1.586l-1.293 1.293a1 1 0 101.414 1.414L5 14.414V16a1 1 0 002 0v-1.586l.293.293a1 1 0 101.414-1.414L7 12.586V11a1 1 0 00-2 0v-1zM15 10a1 1 0 00-1 1v1.586l-1.293 1.293a1 1 0 101.414 1.414L15 14.414V16a1 1 0 002 0v-1.586l.293.293a1 1 0 101.414-1.414L17 12.586V11a1 1 0 00-2 0v-1z" clipRule="evenodd" /></svg>);
const LoadingSpinnerSmall = () => (<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-primary-dark"></div>);
const BookmarkIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>);
const TrashIcon: React.FC<{size?: 'small' | 'normal'}> = ({size = 'normal'}) => (<svg xmlns="http://www.w3.org/2000/svg" className={size === 'small' ? 'h-4 w-4' : 'h-5 w-5'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);

export default JournalPage;