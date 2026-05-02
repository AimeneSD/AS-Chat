import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import { connectSocket, disconnectSocket } from '../socket/socket';

// ─── Création du Context ──────────────────────────────────────────────────────
// On crée "la boîte" qui contiendra l'état global d'authentification.
const AuthContext = createContext(null);

// ─── Clés de stockage localStorage ───────────────────────────────────────────
const TOKEN_KEY = 'as_chat_token';
const USER_KEY  = 'as_chat_user';

// ─── Provider ─────────────────────────────────────────────────────────────────
// Ce composant englobe toute l'app et met à disposition l'état auth à tous ses enfants.
export function AuthProvider({ children }) {
    const [user,    setUser]    = useState(null);
    const [loading, setLoading] = useState(true); // true pendant la vérification initiale du token

    // ── Auto-login au démarrage ──────────────────────────────────────────────
    // Si un token existe en localStorage, on vérifie qu'il est encore valide
    // en appelant /api/auth/me. Si le serveur répond OK, on restaure la session.
    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await authService.me();
                setUser(data);
                connectSocket(token); // On reconnecte le socket avec la session restaurée
            } catch {
                // Token invalide ou expiré : on nettoie le localStorage
                localStorage.removeItem(TOKEN_KEY);
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

        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));

        setUser(data.user);
        connectSocket(data.token); // On ouvre la connexion temps réel dès le login
        return data;
    }, []);

    // ── register ─────────────────────────────────────────────────────────────
    const register = useCallback(async (username, email, password) => {
        const { data } = await authService.register({ username, email, password });

        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));

        setUser(data.user);
        connectSocket(data.token);
        return data;
    }, []);

    // ── logout ───────────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
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

// ─── Hook personnalisé ────────────────────────────────────────────────────────
// Au lieu d'écrire useContext(AuthContext) partout, on écrit juste useAuth().
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un <AuthProvider>');
    }
    return context;
}
