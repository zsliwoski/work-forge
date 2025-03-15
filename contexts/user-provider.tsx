"use client";
import React, { createContext, useContext, ReactNode } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { fetcher } from '@/lib/db';

interface User {
    name: string;
    email: string;
    image: string;
    TeamRoles: {
        role: string;
        Team: {
            id: string;
            name: string;
            icon: string | null | undefined;
            Organization: {
                id: string;
                name: string;
                icon: string | null | undefined;
            };
        };
    }[];
}

interface UserContextProps {
    user: User | null;
    isLoading: boolean;
    isError: boolean;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);


export const UserProvider = ({ children }: { children: ReactNode }) => {
    const { data: session } = useSession();
    const { data: user, error } = useSWR<User>(session ? '/api/user' : null, fetcher);

    const value = {
        user: user || null,
        isLoading: !error && !user,
        isError: !!error,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};