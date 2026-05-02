import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';

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
      {/* 
          Si on est sur le Chat, on veut un fond sombre uni.
          Si on est sur les pages publiques, on garde ton dégradé vert.
      */}
      <div className={`min-h-screen flex flex-col transition-colors duration-500 ${
        isAuthenticated ? 'bg-[#0d1117]' : 'bg-linear-[300deg,#85d67b_70%,#53a449_95%,#000000_105%]'
      }`}>
        <Header />

        <main className="flex-grow flex flex-col text-white">
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

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

        {/* On ne montre le footer que si on n'est pas sur le chat */}
        {!isAuthenticated && <Footer />}
      </div>
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
