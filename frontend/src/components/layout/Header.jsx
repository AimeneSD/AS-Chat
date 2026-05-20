import { Link, useLocation } from 'react-router-dom';
import MachaButton from '../ui/MachaButton';
import { useAuth } from '../../hooks/useAuth';

function Header() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return null;

  return (
    <header className="absolute top-0 left-0 w-full z-50">
      <nav className="container mx-auto px-4 py-3 sm:py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight shrink-0">
         <img src="/assets/icons/as_icon.webp" className='w-12 h-12 sm:w-15 sm:h-15 brightness-0 invert' alt="AS-Chat Logo" />
        </Link>
        <div className="space-x-4 sm:space-x-6"> 
          {location.pathname === '/' && (
            <MachaButton label="Connexion" to="/login" extraClassName="!w-32 sm:!w-40 !h-10 sm:!h-12 !rounded-3xl sm:!rounded-4xl text-white !text-sm sm:!text-[1rem]" />
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;