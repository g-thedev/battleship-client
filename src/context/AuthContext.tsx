import React, { createContext, useEffect, useState, useContext, ReactNode } from 'react';

interface IAuthContextType {
    isAuthenticated: boolean;
    login: (token: { accessToken: string, refreshToken: string }, user_id: string) => void; 
    logout: () => void; 
}

interface IAuthProviderProps {
    children: ReactNode;
}

export const AuthContext = createContext<IAuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<IAuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Or some loading indicator
    }
    

    const login = (token: { accessToken: string, refreshToken: string }, user_id: string) => {
        localStorage.setItem('accessToken', token.accessToken);
        localStorage.setItem('refreshToken', token.refreshToken);
        localStorage.setItem('user_id', user_id);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
