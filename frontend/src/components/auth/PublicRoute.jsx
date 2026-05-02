import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * PublicRoute — Gardien des routes publiques.
 *
 * Si l'utilisateur EST déjà connecté, il est redirigé vers /chat.
 * Pendant la vérification initiale du token (loading), on ne rend rien
 * pour éviter un flash de redirection.
 *
 * Utilisation dans App.jsx :
 *   <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
 */
function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return null;
    }

    // Si connecté → redirige vers le chat
    if (isAuthenticated) {
        return <Navigate to="/chat" replace />;
    }

    return children;
}

export default PublicRoute;
