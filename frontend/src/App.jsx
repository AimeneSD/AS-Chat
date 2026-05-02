import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';

/**
 * AppRoutes — Rendu des routes à l'intérieur du Router.
 * Séparé pour que useLocation() soit disponible dans Header.
 */
function AppRoutes({ isAuthenticated }) {
  // Fond vert dégradé sur les pages publiques, sombre sur le chat
  const bgStyle = isAuthenticated
    ? { background: '#0d1117' }
    : { background: 'linear-gradient(300deg, #85d67b 70%, #53a449 95%, #000000 105%)' };

  return (
    <div className="min-h-screen flex flex-col" style={bgStyle}>
      <Header />

      <main className="grow flex flex-col text-white">
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Route protégée */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthenticated && <Footer />}
    </div>
  );
}

/**
 * AppContent — Sous-composant pour pouvoir utiliser useAuth().
 * Gère l'affichage du Splash Screen pendant le chargement initial.
 */
function AppContent() {
  const { loading, isAuthenticated } = useAuth();

  // 1. Écran de chargement (Splash Screen)
  // Tant que l'AuthContext vérifie le token, on affiche un écran noir neutre
  // pour éviter le flash vert.
  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0d1117] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes isAuthenticated={isAuthenticated} />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
