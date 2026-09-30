// /var/www/html/nvrs-ts-v1-ai-v1/src/app/context/UserContext.tsx

"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define the user role type
export type UserRole = 'none' | 'patron' | 'admin';

// Define the patron type
export type Patron = {
    patron_id: number;
    patron_name: string;
    email: string;
};

// Define the context type
type UserRoleContextType = {
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;
    currentPatron: Patron | null;
    setCurrentPatron: (patron: Patron | null) => void;
    patrons: Patron[];
    login: (patronId: number) => Promise<boolean>;
    logout: () => void;
};

// Hardcoded test patrons (matching database)
const TEST_PATRONS: Patron[] = [
    { patron_id: 1, patron_name: 'Papa', email: 'papatest@example.com' },
    { patron_id: 2, patron_name: 'Mama', email: 'mamatest@example.com' },
    { patron_id: 3, patron_name: 'Son', email: 'sontest@example.com' },
    { patron_id: 4, patron_name: 'Daughter', email: 'daughtertest@example.com' },
    { patron_id: 5, patron_name: 'Toddler', email: 'toddlertest@example.com' },
];

// Create the context with default values
const UserRoleContext = createContext<UserRoleContextType>({
    userRole: 'none',
    setUserRole: () => { },
    currentPatron: null,
    setCurrentPatron: () => { },
    patrons: TEST_PATRONS,
    login: async () => false,
    logout: () => { },
});

// Create a provider component
export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
    const [userRole, setUserRole] = useState<UserRole>('none');
    const [currentPatron, setCurrentPatron] = useState<Patron | null>(null);
    const [patrons] = useState<Patron[]>(TEST_PATRONS);

    // Load from localStorage on mount
    useEffect(() => {
        const savedPatron = localStorage.getItem('currentPatron');
        if (savedPatron) {
            try {
                const parsed = JSON.parse(savedPatron);
                setCurrentPatron(parsed);
                setUserRole('patron');
            } catch (e) {
                console.error('Failed to load patron from localStorage:', e);
            }
        }
    }, []);

    // Save to localStorage when patron changes
    useEffect(() => {
        if (currentPatron) {
            localStorage.setItem('currentPatron', JSON.stringify(currentPatron));
        } else {
            localStorage.removeItem('currentPatron');
        }
    }, [currentPatron]);

    const login = async (patronId: number): Promise<boolean> => {
        const patron = patrons.find(p => p.patron_id === patronId);
        if (patron) {
            setCurrentPatron(patron);
            setUserRole('patron');
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentPatron(null);
        setUserRole('none');
        localStorage.removeItem('currentPatron');
    };

    return (
        <UserRoleContext.Provider value={{
            userRole,
            setUserRole,
            currentPatron,
            setCurrentPatron,
            patrons,
            login,
            logout,
        }}>
            {children}
        </UserRoleContext.Provider>
    );
};

// Custom hook to use the context
export const useUserRole = () => useContext(UserRoleContext);