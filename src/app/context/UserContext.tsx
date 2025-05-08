// /var/www/html/nvrs-ts-v1/src/app/context/UserContext.tsx
"use client"

import { createContext, useContext, useState, ReactNode } from 'react';

// Define the user role type
export type UserRole = 'none' | 'patron' | 'admin';

// Define the context type
type UserRoleContextType = {
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;
};

// Create the context with default values
const UserRoleContext = createContext<UserRoleContextType>({
    userRole: 'none',
    setUserRole: () => { },
});

// Create a provider component
export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
    const [userRole, setUserRole] = useState<UserRole>('none');

    return (
        <UserRoleContext.Provider value={{ userRole, setUserRole }}>
            {children}
        </UserRoleContext.Provider>
    );
};

// Create a custom hook to use the context
export const useUserRole = () => useContext(UserRoleContext);