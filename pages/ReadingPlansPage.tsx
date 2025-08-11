
import React from 'react';
import Header from '../components/Header';
import { READING_PLANS_DATA } from '../constants';
import { ReadingPlan, ReadingProgress } from '../types';
import useUserLocalStorage from '../hooks/useUserLocalStorage';
import useReadingStreak from '../hooks/useReadingStreak';

const ReadingPlansPage: React.FC = () => {
    const [progress, setProgress] = useUserLocalStorage<ReadingProgress>('readingProgress', {});
    const [streak, recordCompletion] = useReadingStreak();

    const toggleDayComplete = (planId: string, dayIndex: number) => {
        const planProgress = progress[planId] || { completedDays: {} };
        const newCompletedDays = { ...planProgress.completedDays };
        const isCompleted = newCompletedDays.hasOwnProperty(dayIndex);
        
        if (isCompleted) {
            delete newCompletedDays[dayIndex];
            // Note: We don't decrement streak on un-checking, as it could be complex to manage.
            // Streaks are only advanced on completion.
        } else {
            newCompletedDays[dayIndex] = new Date().toISOString();
            recordCompletion();
        }
        
        setProgress({
            ...progress,
            [planId]: { completedDays: newCompletedDays }
        });
    };

    return (
        <div>
            <Header title="Reading Plans" subtitle="Follow a structured path through Scripture.">
                <div className="absolute top-4 right-4">
                    <StreakDisplay count={streak} />
                </div>
            </Header>
            
            <div className="p-4 max-w-4xl mx-auto space-y-6">
                {READING_PLANS_DATA.map(plan => (
                    <PlanCard 
                        key={plan.id} 
                        plan={plan} 
                        progress={progress[plan.id]?.completedDays || {}}
                        onToggleDay={toggleDayComplete}
                    />
                ))}
            </div>
        </div>
    );
};

// --- Child Components ---

interface PlanCardProps {
    plan: ReadingPlan;
    progress: Record<number, string>;
    onToggleDay: (planId: string, dayIndex: number) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, progress, onToggleDay }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const completedCount = Object.keys(progress).length;
    const completionPercentage = plan.durationDays > 0 ? Math.round((completedCount / plan.durationDays) * 100) : 0;

    return (
        <div className="bg-white dark:bg-neutral-800/50 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-primary dark:text-secondary">{plan.title}</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{plan.description}</p>
                    </div>
                    <span className="text-lg font-bold text-neutral-700 dark:text-neutral-200">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5 mt-2">
                    <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
                </div>
            </div>
            
            {isOpen && (
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {Array.from({ length: plan.durationDays }, (_, i) => {
                        const isCompleted = progress.hasOwnProperty(i);
                        return (
                            <button
                                key={i}
                                onClick={() => onToggleDay(plan.id, i)}
                                className={`p-2 rounded-md text-center text-sm font-semibold transition-colors ${
                                    isCompleted 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                                }`}
                                title={plan.passages[i] || `Day ${i + 1}`}
                            >
                                Day {i + 1}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


interface StreakDisplayProps {
    count: number;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ count }) => {
    if (count === 0) return null;

    return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-300 font-semibold text-sm shadow-inner dark:shadow-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45.12l-2.495 4.888c-.11.216-.298.393-.523.492l-5.36 1.44A1 1 0 001.53 10.5l3.88 3.785a1 1 0 00.29.728l-.915 5.337a1 1 0 001.45 1.054l4.795-2.52c.196-.104.43-.104.626 0l4.795 2.52a1 1 0 001.45-1.054l-.915-5.337a1 1 0 00.29-.728l3.88-3.785a1 1 0 00-.435-1.765l-5.36-1.44a1 1 0 00-.523-.492L13.845 2.673a1 1 0 00-1.45-.12zM10 15.338L6.468 17.29l.7-4.11L4.1 10.042l4.13-.593L10 5.667l1.77 3.78 4.13.593-3.068 3.138.7 4.11L10 15.338z" clipRule="evenodd" />
            </svg>
            <span style={{lineHeight: 1}}>{count} Day Streak</span>
        </div>
    );
};


export default ReadingPlansPage;
