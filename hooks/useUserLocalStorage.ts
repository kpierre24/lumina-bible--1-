
import { useAuth } from '../contexts/AuthContext';
import useLocalStorage from './useLocalStorage';

/**
 * A hook for persisting state to localStorage, scoped to the current user.
 * Data will only be stored if a user is logged in.
 * When the user logs in or out, the hook automatically switches to the correct data store.
 * @param key The key for the data within the user's storage.
 * @param initialValue The initial value to use if no data is found.
 * @returns A stateful value, and a function to update it.
 */
function useUserLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const { user } = useAuth();

    // Create a unique key for the user. If no user, key is null.
    const userKey = user ? `lumina_user_${user.id}_${key}` : null;

    // `useLocalStorage` is designed to handle a null key, returning initialValue.
    return useLocalStorage<T>(userKey, initialValue);
}

export default useUserLocalStorage;
