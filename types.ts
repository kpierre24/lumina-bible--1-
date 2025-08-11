
export interface Prayer {
    id: string;
    request: string;
    date: string;
    isAnswered: boolean;
    scripture?: string;
}

export interface Bookmark {
    id: string; // e.g., "john-3-16-kjv"
    reference: string; // e.g., "John 3:16"
    text: string;
    translation: string;
    notes: string[];
    createdAt: string;
}

export interface ReadingPlan {
    id:string;
    title: string;
    description: string;
    durationDays: number;
    passages: string[];
}

export interface ReadingProgress {
    [planId: string]: {
        // Storing completion date for each day to enable streak tracking
        completedDays: Record<number, string>; // { dayIndex: isoDateString }
    };
}

export interface Verse {
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
}

export interface BibleApiResponse {
    reference: string;
    verses: Verse[];
    text: string;
    translation_id: string;
    translation_name: string;
    translation_note: string;
}

export interface UserPreferences {
    defaultTranslation: string;
    defaultSideBySide: boolean;
    theme: 'light' | 'dark' | 'system';
}
