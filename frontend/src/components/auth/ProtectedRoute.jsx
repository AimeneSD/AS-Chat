import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * ProtectedRoute — Gardien des routes privées.
 *
 * Si l'utilisateur n'est pas connecté, il est redirigé vers /login.
 * Pendant la vérification initiale du token (loading), on affiche rien
 * pour éviter un flash de redirection.
 *
 * Utilisation dans App.jsx :
 *   <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
 */
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    // Pendant la vérification du token au démarrage, on ne rend rien
    // (évite le "flash" où l'utilisateur connecté est redirigé vers /login une fraction de seconde)
    if (loading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
