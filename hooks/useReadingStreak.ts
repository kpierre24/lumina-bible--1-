
import useUserLocalStorage from './useUserLocalStorage';

interface StreakData {
    streak: number;
    lastReadDate: string | null;
}

const areDatesConsecutive = (date1: Date, date2: Date) => {
    return date1.getTime() - date2.getTime() === 24 * 60 * 60 * 1000;
};

const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function useReadingStreak(): [number, () => void] {
    const [streakData, setStreakData] = useUserLocalStorage<StreakData>('readingStreak', {
        streak: 0,
        lastReadDate: null,
    });

    const recordCompletion = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        const lastRead = streakData.lastReadDate ? new Date(streakData.lastReadDate) : null;

        if (!lastRead) {
            // First time reading
            setStreakData({ streak: 1, lastReadDate: today.toISOString() });
        } else {
            if (isSameDay(today, lastRead)) {
                // Already read today, do nothing
                return;
            }

            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);

            if (isSameDay(lastRead, yesterday)) {
                // Consecutive day
                setStreakData({ streak: streakData.streak + 1, lastReadDate: today.toISOString() });
            } else {
                // Broke the streak
                setStreakData({ streak: 1, lastReadDate: today.toISOString() });
            }
        }
    };

    return [streakData.streak, recordCompletion];
}

export default useReadingStreak;