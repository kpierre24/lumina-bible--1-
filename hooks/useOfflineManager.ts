
import { useState, useCallback, useRef, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { NEW_TESTAMENT_BOOKS } from '../constants';

export type DownloadStatus = 'not_downloaded' | 'downloading' | 'downloaded' | 'error';

export interface Progress {
    percentage: number;
    details: string;
}

const API_CACHE_NAME = 'lumina-api-v3';

export const useOfflineManager = () => {
    const [statuses, setStatuses] = useLocalStorage<Record<string, DownloadStatus>>('offlineStatuses', {});
    const [progress, setProgress] = useState<Record<string, Progress>>({});
    const abortControllers = useRef<Record<string, AbortController>>({});

    useEffect(() => {
        // Clean up abort controllers on unmount
        return () => {
            Object.values(abortControllers.current).forEach(controller => controller.abort());
        };
    }, []);
    
    const downloadTranslation = useCallback(async (translationId: string) => {
        if (statuses[translationId] === 'downloading') return;

        setStatuses(prev => ({ ...prev, [translationId]: 'downloading' }));
        setProgress(prev => ({ ...prev, [translationId]: { percentage: 0, details: 'Starting...' } }));

        const controller = new AbortController();
        abortControllers.current[translationId] = controller;
        
        const books = NEW_TESTAMENT_BOOKS;
        const totalChapters = books.reduce((sum, book) => sum + book.chapters, 0);
        let chaptersDownloaded = 0;

        try {
            for (const book of books) {
                for (let chapter = 1; chapter <= book.chapters; chapter++) {
                    if (controller.signal.aborted) {
                        throw new DOMException('Download aborted by user', 'AbortError');
                    }

                    const query = `${book.name} ${chapter}`;
                    const url = `https://bible-api.com/${encodeURI(query)}?translation=${translationId}`;
                    
                    // We don't use the response directly, just rely on the service worker to cache it.
                    const response = await fetch(url, { signal: controller.signal });
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${query}`);
                    }

                    chaptersDownloaded++;
                    const percentage = Math.round((chaptersDownloaded / totalChapters) * 100);
                    setProgress(prev => ({
                        ...prev,
                        [translationId]: { percentage, details: `Downloading ${book.name} ${chapter}/${book.chapters}` }
                    }));
                }
            }

            setStatuses(prev => ({ ...prev, [translationId]: 'downloaded' }));
            setProgress(prev => ({ ...prev, [translationId]: { percentage: 100, details: 'Completed' } }));

        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log(`Download for ${translationId} was cancelled.`);
                setStatuses(prev => ({ ...prev, [translationId]: 'not_downloaded' }));
            } else {
                console.error(`Download for ${translationId} failed:`, error);
                setStatuses(prev => ({ ...prev, [translationId]: 'error' }));
                 setProgress(prev => ({ ...prev, [translationId]: { percentage: prev[translationId]?.percentage || 0, details: 'Download failed.' } }));
            }
        } finally {
            delete abortControllers.current[translationId];
        }
    }, [statuses, setStatuses]);

    const deleteTranslation = useCallback(async (translationId: string) => {
        try {
            const cache = await caches.open(API_CACHE_NAME);
            const requests = await cache.keys();
            
            const requestsToDelete = requests.filter(req => {
                const url = new URL(req.url);
                return url.hostname === 'bible-api.com' && url.searchParams.get('translation') === translationId;
            });
            
            await Promise.all(requestsToDelete.map(req => cache.delete(req)));

            console.log(`Deleted offline data for ${translationId}`);
            setStatuses(prev => ({ ...prev, [translationId]: 'not_downloaded' }));
            setProgress(prev => ({ ...prev, [translationId]: { percentage: 0, details: '' } }));
        } catch (error) {
            console.error(`Failed to delete offline data for ${translationId}:`, error);
            setStatuses(prev => ({ ...prev, [translationId]: 'error' }));
        }
    }, [setStatuses]);

    const cancelDownload = useCallback((translationId: string) => {
        if (abortControllers.current[translationId]) {
            abortControllers.current[translationId].abort();
        }
    }, []);

    return { statuses, progress, downloadTranslation, deleteTranslation, cancelDownload };
};
