"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface TeamContextProps {
    teamId: string | null;
    setTeamId: (id: string) => void;
}

const TeamContext = createContext<TeamContextProps | undefined>(undefined);

export const useTeam = () => {
    const context = useContext(TeamContext);
    if (!context) {
        throw new Error('useTeam must be used within a TeamProvider');
    }
    return context;
};

export const TeamProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [teamId, setTeamId] = useState<string | null>(null);

    useEffect(() => {
        if (pathname) {
            const pathSegments = pathname.split('/');
            if (pathSegments.length > 2) {
                setTeamId(pathSegments[2]);
                console.log(pathSegments[2])
            } else {
                const localTeamId = localStorage.getItem('teamId');
                if (localTeamId) {
                    updateTeamId(localTeamId);
                }
            }
        }
    }, [pathname]);

    const updateTeamId = (id: string) => {
        setTeamId(id);
        console.log(id);
        localStorage.setItem('teamId', id);
        const pathSegments = pathname.split('/');
        router.push(`/${pathSegments[1]}/${id}`);
    };

    return (
        <TeamContext.Provider value={{ teamId, setTeamId: updateTeamId }}>
            {children}
        </TeamContext.Provider>
    );
};