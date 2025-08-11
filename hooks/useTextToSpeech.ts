
import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeakOptions {
    text: string;
    // An array containing the start index of each verse in the combined text
    verseOffsets: number[];
    onEnd: () => void;
}

export const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [highlightedVerseIndex, setHighlightedVerseIndex] = useState<number | null>(null);

    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const verseOffsetsRef = useRef<number[]>([]);

    useEffect(() => {
        const synth = window.speechSynthesis;
        const handleUnload = () => {
             if (synth.speaking) {
                synth.cancel();
            }
        }
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            if (synth.speaking) {
                synth.cancel();
            }
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, []);
    
    const handleBoundary = useCallback((event: SpeechSynthesisEvent) => {
        const charIndex = event.charIndex;
        let currentVerse = 0;
        for (let i = verseOffsetsRef.current.length - 1; i >= 0; i--) {
            if (charIndex >= verseOffsetsRef.current[i]) {
                currentVerse = i;
                break;
            }
        }
        setHighlightedVerseIndex(currentVerse);
    }, []);

    const speak = useCallback(({ text, verseOffsets, onEnd }: SpeakOptions) => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;
        verseOffsetsRef.current = verseOffsets;

        utterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
            setHighlightedVerseIndex(0);
        };
        utterance.onpause = () => {
            setIsPaused(true);
        };
        utterance.onresume = () => {
            setIsPaused(false);
        };
        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            setHighlightedVerseIndex(null);
            utteranceRef.current = null;
            verseOffsetsRef.current = [];
            onEnd();
        };
        utterance.onboundary = handleBoundary;

        window.speechSynthesis.speak(utterance);
    }, [handleBoundary]);

    const pause = useCallback(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
        }
    }, []);

    const resume = useCallback(() => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
    }, []);

    const cancel = useCallback(() => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
    }, []);

    return { speak, pause, resume, cancel, isSpeaking, isPaused, highlightedVerseIndex };
};
