import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MachaButton from "../components/ui/MachaButton";
import { useAuth } from '../hooks/useAuth';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grow flex items-center justify-center px-4 py-8">
      <div className="bg-[#a4f3a6]/95 w-full max-w-sm sm:max-w-md lg:max-w-[25vw] h-fit flex flex-col items-center rounded-2xl backdrop-blur-sm p-6 sm:p-8 shadow-2xl border border-white/20">
        <div className="flex flex-col gap-y-6 sm:gap-y-8 text-center w-full">
          <h1 className="text-2xl sm:text-3xl text-white font-bold tracking-tight">Se connecter</h1>

          <div className="w-full">
            <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-5 w-full">
              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-500/20 border border-red-400 text-red-100 text-sm rounded-xl px-4 py-2">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-black/80 font-semibold text-sm ml-1" htmlFor="email">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-0 bg-white/40 backdrop-blur-md p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder:text-black/40 text-black text-base"
                />
              </div>

              {/* Mot de passe */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-black/80 font-semibold text-sm ml-1" htmlFor="password">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-0 bg-white/40 backdrop-blur-md p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder:text-black/40 text-black text-base"
                />
              </div>

              <div className="pt-2">
                <MachaButton
                  label={loading ? 'Connexion...' : 'Connexion'}
                  type="submit"
                  disabled={loading}
                  extraClassName="!w-full !rounded-2xl text-white !text-[1.1rem] !py-3.5 shadow-lg"
                />
              </div>
            </form>

            <p className="pt-5 text-black/70 text-sm">
              Vous n'avez pas de compte ?{' '}
              <Link to="/signup" className="text-white font-bold hover:underline transition-all">
                Inscrivez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
