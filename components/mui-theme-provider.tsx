"use client";

import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
    palette: {
        primary: {
            main: '#16a34a', // Green-600 to match Tailwind
            50: '#f0fdf4',
            100: '#dcfce7',
        },
        secondary: {
            main: '#6b7280', // Gray-500
        },
        background: {
            default: '#f9fafb', // Gray-50
            paper: '#ffffff',
        },
        text: {
            primary: '#111827', // Gray-900
            secondary: '#6b7280', // Gray-500
        },
    },
    typography: {
        fontFamily: 'inherit', // Use system fonts
    },
    components: {
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: '1px solid #e5e7eb', // Gray-200
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: '6px',
                    margin: '2px 8px',
                    '&:hover': {
                        backgroundColor: '#f3f4f6', // Gray-100
                    },
                },
            },
        },
    },
});

interface MUIThemeProviderProps {
    children: React.ReactNode;
}

export function MUIThemeProvider({ children }: MUIThemeProviderProps) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}