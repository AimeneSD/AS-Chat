import {  useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import { connectSocket, disconnectSocket } from '../socket/socket';

import { AuthContext } from './AuthContextInstance';

const USER_KEY  = 'as_chat_user';

// ─── Provider ─────────────────────────────────────────────────────────────────
// Ce composant englobe toute l'app et met à disposition l'état auth à tous ses enfants.
export function AuthProvider({ children }) {
    const [user,    setUser]    = useState(null);
    const [loading, setLoading] = useState(true); // true pendant la vérification initiale du token

    // ── Auto-login au démarrage ──────────────────────────────────────────────
    // On appelle toujours /api/auth/me au démarrage pour voir si on a un cookie de session valide.
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const { data } = await authService.me();
                setUser(data);
                connectSocket(); // On connecte le socket (le cookie partira avec)
            } catch {
                // Token invalide, manquant ou expiré : on nettoie le localStorage
                localStorage.removeItem(USER_KEY);
            } finally {
                setLoading(false);
            }
        };

        restoreSession();
    }, []);

    // ── login ────────────────────────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        const { data } = await authService.login({ email, password });

        localStorage.setItem(USER_KEY, JSON.stringify(data.user));

        setUser(data.user);
        connectSocket(); // On ouvre la connexion temps réel dès le login
        return data;
    }, []);

    // ── register ─────────────────────────────────────────────────────────────
    const register = useCallback(async (username, email, password) => {
        const { data } = await authService.register({ username, email, password });

        localStorage.setItem(USER_KEY, JSON.stringify(data.user));

        setUser(data.user);
        connectSocket();
        return data;
    }, []);

    // ── logout ───────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        try {
            await authService.logout(); // On demande au serveur de supprimer le cookie
        } catch (err) {
            console.error('Erreur lors de la déconnexion backend', err);
        }
        localStorage.removeItem(USER_KEY);
        setUser(null);
        disconnectSocket(); // On coupe la connexion Socket.io proprement
    }, []);

    // ── Valeur exposée à toute l'app ─────────────────────────────────────────
    const value = { user, loading, login, register, logout, isAuthenticated: !!user };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
