
import { BibleApiResponse } from '../types';

const API_URL = 'https://bible-api.com/';

export const fetchVerse = async (query: string, translation: string = 'kjv'): Promise<BibleApiResponse> => {
    try {
        // The bible-api.com service expects colons in verses (e.g., John 3:16) to be unencoded.
        // encodeURIComponent was converting ':' to '%3A', causing the API to fail.
        // encodeURI correctly encodes spaces and other characters while preserving the colon.
        const response = await fetch(`${API_URL}${encodeURI(query)}?translation=${translation}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `Request failed with status: ${response.status}`}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data: BibleApiResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching verse:", error);
        throw error;
    }
};
