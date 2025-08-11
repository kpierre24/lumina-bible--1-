
import React, { useState } from 'react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAnswerToQuestion } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const AskLearnPage: React.FC = () => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;
        
        setLoading(true);
        setError(null);
        setAnswer('');

        try {
            const result = await getAnswerToQuestion(question);
            setAnswer(result);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header title="Ask & Learn" subtitle="Get plain-language answers to your theological questions." />
            
            <div className="p-4 max-w-4xl mx-auto space-y-6">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800/50 p-4 rounded-lg shadow-sm space-y-3">
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g., What is the trinity? or Why did Jesus speak in parables?"
                        rows={4}
                        className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-primary text-white rounded-md font-semibold hover:bg-primary-dark transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed">
                        {loading ? 'Thinking...' : 'Ask Question'}
                    </button>
                </form>

                {loading && <LoadingSpinner />}
                {error && <div className="text-red-500 bg-red-100 dark:bg-red-900/50 p-3 rounded-md text-center">{error}</div>}

                {answer && (
                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
                         <h3 className="text-xl font-bold text-primary dark:text-secondary mb-3">
                            Answer
                         </h3>
                        <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 leading-relaxed">
                             <ReactMarkdown
                                children={answer}
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

export default AskLearnPage;