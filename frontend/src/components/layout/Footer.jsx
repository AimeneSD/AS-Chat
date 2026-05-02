import {useLocation} from 'react-router-dom'

function Footer() {
  const location = useLocation();

  if (location.pathname != '/') {
    return null;
  }

  return (
    <footer className="bg-[#4c7a48]    py-8">
      <div className="container mx-auto px-4 text-center text-white text-sm">
        <p>&copy; {new Date().getFullYear()} AS-Chat. Tous droits réservés.</p>
      </div>
    </footer>
  );
}

export default Footer;