import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContextInstance';

/**
 * useAuth — Hook personnalisé pour accéder au contexte d'authentification.
 * On le sépare dans un fichier à part pour satisfaire les règles du Fast Refresh de Vite.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un <AuthProvider>');
    }
    return context;
}
