function Signup() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Inscription</h1>
      <form className="mt-4 flex flex-col gap-4 max-w-sm">
        <input type="text" placeholder="Nom d'utilisateur" className="border p-2 rounded" />
        <input type="email" placeholder="Email" className="border p-2 rounded" />
        <input type="password" placeholder="Mot de passe" className="border p-2 rounded" />
        <button className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors">
          S'inscrire
        </button>
      </form>
    </div>
  );
}

export default Signup;
