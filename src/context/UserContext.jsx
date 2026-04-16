import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            // Validate the stored token against the current database
            fetch('/api/auth/me', { headers: { Authorization: `Bearer ${parsed.token}` } })
                .then(async res => {
                    if (res.ok) {
                        const freshUserData = await res.json();
                        // Merge fresh data with existing token
                        const updatedUser = { ...parsed, ...freshUserData };
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    } else {
                        // Token is stale or user doesn't exist in current DB — clear it
                        console.warn('Stale session detected, logging out automatically.');
                        localStorage.removeItem('user');
                    }
                    setLoading(false);
                })
                .catch(() => {
                    // Network error — still load the cached user so offline works
                    setUser(parsed);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <UserContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
