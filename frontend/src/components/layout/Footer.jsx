function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-8">
      <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AS-Chat. Tous droits réservés.</p>
      </div>
    </footer>
  );
}

export default Footer;