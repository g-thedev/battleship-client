import React, { createContext, useEffect, useState, useContext, ReactNode } from 'react';
import { isTokenExpired, getSecondsUntilExpiry } from '../utils/tokenUtils';
import { callRefreshToken } from '../services/api';
// import { useNavigate } from 'react-router-dom';

interface IAuthContextType {
    isAuthenticated: boolean;
    login: (token: { accessToken: string, refreshToken: string }, user_id: string) => void; 
    logout: () => void; 
    checkTokenAndRefresh: () => void;
}

interface IAuthProviderProps {
    children: ReactNode;
}

export const AuthContext = createContext<IAuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<IAuthProviderProps> = ({ children }) => {
    // const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const login = (token: { accessToken: string, refreshToken: string }, user_id: string) => {
        // change to sessionStorage?
        localStorage.setItem('accessToken', token.accessToken);
        // Okay to keep in localStorage
        localStorage.setItem('refreshToken', token.refreshToken);
        localStorage.setItem('user_id', user_id);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user_id');
        setIsAuthenticated(false);
    };

    const checkTokenAndRefresh = async () => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
    
        if (accessToken && getSecondsUntilExpiry(accessToken) <= 120) { 
            if (refreshToken && !isTokenExpired(refreshToken)) {
                try {
                    const refreshed = await callRefreshToken();
                    if (refreshed !== undefined) {
                        login(refreshed.token, localStorage.getItem('user_id')!);
                    } else {
                        logout();
                        // Optionally, navigate to login if needed
                        // navigate('/login');
                    }
                } catch (error) {
                    console.error('Error refreshing token:', error);
                    logout();
                    // Optionally, navigate to login if needed
                    // navigate('/login');
                }
            } else {
                logout();
            //     // Optionally, navigate to login if needed
            //     // navigate('/login');
            }
        }
    };
    

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        // Refresh token periodically
        console.log('Setting interval');
        const intervalId = setInterval(() => {
            checkTokenAndRefresh();
        }, (13 * 60 * 1000)); 

        return () => {
            console.log('Interval cleared');
            clearInterval(intervalId);
        };
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Or some loading indicator
    }
    
    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, checkTokenAndRefresh }}>
            {children}
        </AuthContext.Provider>
    );
};
