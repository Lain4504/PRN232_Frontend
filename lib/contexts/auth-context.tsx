"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AuthUser, AuthSession, LoginFormData, RegistrationFormData } from "@/lib/types/auth";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
    user: AuthUser | null;
    session: AuthSession | null;
    isLoading: boolean;
    login: (data: LoginFormData) => Promise<void>;
    register: (data: RegistrationFormData) => Promise<void>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [session, setSession] = useState<AuthSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Helper to save session to localStorage and cookies
    const saveSession = useCallback((newSession: AuthSession) => {
        setSession(newSession);
        setUser(newSession.user);

        if (typeof window !== 'undefined') {
            localStorage.setItem("auth_session", JSON.stringify(newSession));
            // Set simple cookie for middleware (accessible by server)
            document.cookie = `auth_token=${newSession.accessToken}; path=/; max-age=${60 * 60}; SameSite=Lax`;
            document.cookie = `refresh_token=${newSession.refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
        }
    }, []);

    // Helper to clear session
    const clearSession = useCallback(() => {
        setSession(null);
        setUser(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem("auth_session");
            localStorage.removeItem("activeProfileId");
            localStorage.removeItem("activeTeamId");
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }, []);

    // Load session on init
    useEffect(() => {
        const loadSession = async () => {
            try {
                const searchParams = new URLSearchParams(window.location.search);
                const urlToken = searchParams.get('token');
                const urlRefreshToken = searchParams.get('refreshToken');

                if (urlToken && urlRefreshToken) {
                    // We have tokens from social login
                    // Fetch user info with this token
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5283/api'}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${urlToken}` }
                    });

                    if (response.ok) {
                        const json = await response.json();
                        if (json.success && json.data) {
                            const newSession: AuthSession = {
                                accessToken: urlToken,
                                refreshToken: urlRefreshToken,
                                expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                                tokenType: "Bearer",
                                user: json.data
                            };
                            saveSession(newSession);
                            // Clear query params
                            router.replace(window.location.pathname);
                            return;
                        }
                    }
                }

                const savedSession = localStorage.getItem("auth_session");
                if (savedSession) {
                    const parsed = JSON.parse(savedSession) as AuthSession;
                    setSession(parsed);
                    setUser(parsed.user);
                } else if (!urlToken) {
                    // No session in local storage and no token in URL
                    // If cookies persist, they might cause a loop with middleware.
                    // We attempt to clear them here as a failsafe.
                    document.cookie = "auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
                    document.cookie = "refresh_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
                }
            } catch (err) {
                console.error("Failed to load session", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadSession();
    }, [router, saveSession]);

    const login = async (data: LoginFormData) => {
        try {
            const response = await api.post<AuthSession>("/auth/login", data, { requireAuth: false });
            if (response.success) {
                saveSession(response.data);
                toast.success("Identity verified. Access granted.");
                router.push("/overview");
            } else {
                throw new Error(response.message || "Login failed");
            }
        } catch (error: any) {
            toast.error(error.message || "Login failed");
            throw error;
        }
    };

    const register = async (data: RegistrationFormData) => {
        try {
            const response = await api.post<AuthSession>("/auth/register", data, { requireAuth: false });
            if (response.success) {
                saveSession(response.data);
                toast.success("Account created successfully.");
                router.push("/overview");
            } else {
                throw new Error(response.message || "Registration failed");
            }
        } catch (error: any) {
            toast.error(error.message || "Registration failed");
            throw error;
        }
    };

    const logout = async () => {
        try {
            if (session) {
                await api.post("/auth/logout", { refreshToken: session.refreshToken });
            }
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            clearSession();
            router.push("/auth/login");
            toast.info("Logged out successfully");
        }
    };

    const refreshSession = async () => {
        if (!session?.refreshToken) return;

        try {
            const response = await api.post<AuthSession>("/auth/refresh", {
                refreshToken: session.refreshToken
            }, { requireAuth: false });

            if (response.success) {
                saveSession(response.data);
            } else {
                clearSession();
                router.push("/auth/login");
            }
        } catch (error) {
            clearSession();
            router.push("/auth/login");
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, login, register, logout, refreshSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
