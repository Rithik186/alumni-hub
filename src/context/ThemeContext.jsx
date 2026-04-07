import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const { user } = useUser();
    const [theme, setTheme] = useState('light');
    const [fontSize, setFontSize] = useState('medium');
    const [compact, setCompact] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Load settings from DB on login
    useEffect(() => {
        if (!user?.token) {
            // Reset to defaults when logged out
            applyTheme('light');
            applyFontSize('medium');
            applyCompact(false);
            return;
        }
        loadSettings();
    }, [user?.token]);

    const loadSettings = async () => {
        try {
            const { data } = await axios.get('/api/settings', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const t = data.appearance_theme || 'light';
            const fs = data.appearance_font_size || 'medium';
            const c = data.appearance_compact ?? false;
            setTheme(t);
            setFontSize(fs);
            setCompact(c);
            applyTheme(t);
            applyFontSize(fs);
            applyCompact(c);
        } catch {
            // Use defaults silently
        } finally {
            setLoaded(true);
        }
    };

    // Apply theme to <html> element
    const applyTheme = (t) => {
        const root = document.documentElement;
        if (t === 'dark') {
            root.classList.add('dark');
            root.setAttribute('data-theme', 'dark');
        } else if (t === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                root.classList.add('dark');
                root.setAttribute('data-theme', 'dark');
            } else {
                root.classList.remove('dark');
                root.setAttribute('data-theme', 'light');
            }
        } else {
            root.classList.remove('dark');
            root.setAttribute('data-theme', 'light');
        }
    };

    // Apply font size to <html> element
    const applyFontSize = (fs) => {
        const root = document.documentElement;
        root.classList.remove('font-small', 'font-medium', 'font-large');
        root.classList.add(`font-${fs}`);
        root.setAttribute('data-font-size', fs);
    };

    // Apply compact mode
    const applyCompact = (c) => {
        const root = document.documentElement;
        if (c) {
            root.classList.add('compact');
            root.setAttribute('data-compact', 'true');
        } else {
            root.classList.remove('compact');
            root.setAttribute('data-compact', 'false');
        }
    };

    // Called from Settings page when user changes a setting
    const updateTheme = (t) => { setTheme(t); applyTheme(t); };
    const updateFontSize = (fs) => { setFontSize(fs); applyFontSize(fs); };
    const updateCompact = (c) => { setCompact(c); applyCompact(c); };

    // Listen for system theme changes when set to 'auto'
    useEffect(() => {
        if (theme !== 'auto') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => {
            if (e.matches) {
                document.documentElement.classList.add('dark');
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.setAttribute('data-theme', 'light');
            }
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, fontSize, compact, updateTheme, updateFontSize, updateCompact, loaded }}>
            {children}
        </ThemeContext.Provider>
    );
};
