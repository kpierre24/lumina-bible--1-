
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set. Some features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getDevotionalForVerse = async (verse: string, verseText: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return "API Key not configured. AI features are unavailable.";
    }
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `The Bible verse is ${verse}: "${verseText}". Provide a short, uplifting devotional (around 150 words). Explain its historical and theological context, key themes, and offer a practical application for today's life. Format it with markdown for readability (e.g., use bold for headers).`,
            config: {
                systemInstruction: "You are a warm, insightful Bible devotional writer. Your tone should be encouraging and accessible.",
                temperature: 0.7,
            }
        });
        return result.text;
    } catch (error) {
        console.error("Error generating devotional:", error);
        return "Could not generate devotional at this time. Please try again later.";
    }
};

export const getVerseForPrayer = async (prayerRequest: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API Key not configured. AI features are unavailable.");
    }
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on the following prayer concern, suggest a single, relevant, and comforting Bible verse reference (e.g., 'John 3:16'). ONLY return the single verse reference and nothing else. Prayer: "${prayerRequest}"`,
            config: {
                systemInstruction: "You are an AI assistant that finds comforting Bible verses. Your only output should be a scripture reference.",
                temperature: 0.3,
            }
        });
        // Return only the text, trimmed of any whitespace or markdown.
        return result.text.trim().replace(/`/g, '');
    } catch (error) {
        console.error("Error suggesting verse:", error);
        throw new Error("Could not suggest a verse at this time.");
    }
};

export const getAnswerToQuestion = async (question: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return "API Key not configured. AI features are unavailable.";
    }
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: question,
            config: {
                systemInstruction: "You are a helpful and knowledgeable Bible assistant. Answer theological questions in a clear, plain-language way, citing scripture references (e.g., John 3:16) where appropriate. Be respectful and focus on mainstream Christian theology. Keep answers concise and well-structured.",
                temperature: 0.5,
            }
        });
        return result.text;
    } catch (error) {
        console.error("Error getting answer:", error);
        return "Could not get an answer at this time. Please check your connection and try again.";
    }
};

export const getSermonOutline = async (passage: string, text: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return "API Key not configured. AI features are unavailable.";
    }
    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a theological assistant who creates study outlines. Based on the passage ${passage}: "${text}", generate a concise study outline. Use markdown formatting. Provide an introduction, 3-4 key points with brief explanations, and a section for practical application or reflection.`,
            config: {
                systemInstruction: "You create clear, insightful, and well-structured Bible study outlines.",
                temperature: 0.6,
            }
        });
        return result.text;
    } catch (error) {
        console.error("Error generating sermon outline:", error);
        return "Could not generate an outline at this time. Please try again later.";
    }
};