import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-linear-[300deg,#85d67b_70%,#53a449_95%,#000000_105%] flex flex-col">
          <Header />

          <main className="flex-grow flex flex-col text-white px-4 py-8">
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Route protégée — accessible uniquement si connecté */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                  <Chat />
              </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
