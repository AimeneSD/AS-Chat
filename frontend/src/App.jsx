import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-linear-[300deg,#85d67b_70%,#53a449_95%,#000000_105%] flex flex-col">
        <Header />
        
        <main className="flex-grow flex flex-col text-white px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* Fallback route */}
            <Route path="*" element={<div className="flex-grow flex items-center justify-center">404 - Page non trouvée</div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
