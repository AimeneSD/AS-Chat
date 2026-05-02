function Login() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Connexion</h1>
      <form className="mt-4 flex flex-col gap-4 max-w-sm">
        <input type="email" placeholder="Email" className="border p-2 rounded" />
        <input type="password" placeholder="Mot de passe" className="border p-2 rounded" />
        <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors">
          Se connecter
        </button>
      </form>
    </div>
  );
}

export default Login;
