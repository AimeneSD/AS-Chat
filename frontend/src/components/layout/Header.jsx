import { Link } from 'react-router-dom';
import MachaButton from '../ui/MachaButton';

function Header() {
  return (
    <header className=" ">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight">
         <img src="/assets/icons/as_icon.webp" className='w-15 h-15 brightness-0 invert' alt="" />
        </Link>
        <div className="space-x-6">
          <Link to="/" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
            Accueil
          </Link>
          <MachaButton label="Connexion" to="/login" extraClassName="!w-40 !h-12 !rounded-2xl text-white  !text-[1rem]" />
        </div>
      </nav>
    </header>
  );
}

export default Header;