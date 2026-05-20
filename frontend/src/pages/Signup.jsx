import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MachaButton from "../components/ui/MachaButton";
import { useAuth } from '../hooks/useAuth';

function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(username, email, password);
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
        <div className="flex flex-col gap-y-5 text-center w-full">
          <h1 className="text-2xl sm:text-3xl text-white font-bold tracking-tight">Créer un compte</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-500/20 border border-red-400 text-red-100 text-sm rounded-xl px-4 py-2">
                {error}
              </div>
            )}

            {/* Nom d'utilisateur */}
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-black/80 font-semibold text-sm ml-1" htmlFor="username">
                Nom d'utilisateur <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                placeholder="Comment doit-on vous appeler ?"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-0 bg-white/40 backdrop-blur-md p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder:text-black/40 text-black text-base"
              />
            </div>

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
                placeholder="Min. 12 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-0 bg-white/40 backdrop-blur-md p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder:text-black/40 text-black text-base"
              />
            </div>

            {/* Date de naissance */}
            <div className="flex flex-col gap-2 text-left">
              <label className="text-black/80 font-semibold text-sm ml-1">
                Date de naissance <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select className="flex-1 bg-[#4c7a48] text-gray-300 p-3 rounded-lg border-0 outline-none cursor-pointer hover:bg-[#3c683a] transition-colors appearance-none text-sm">
                  <option value="" disabled defaultValue>Jour</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select className="flex-[2] bg-[#4c7a48] text-gray-300 p-3 rounded-lg border-0 outline-none cursor-pointer hover:bg-[#3c683a] transition-colors appearance-none text-sm">
                  <option value="" disabled defaultValue>Mois</option>
                  {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <select className="flex-[1.5] bg-[#4c7a48] text-gray-300 p-3 rounded-lg border-0 outline-none cursor-pointer hover:bg-[#3c683a] transition-colors appearance-none text-sm">
                  <option value="" disabled defaultValue>Année</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <MachaButton
                label={loading ? 'Création...' : "S'inscrire"}
                type="submit"
                disabled={loading}
                extraClassName="!w-full !rounded-2xl text-white !text-[1.1rem] !py-3.5 shadow-lg"
              />
            </div>
          </form>

          <p className="text-black/70 text-sm">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-white font-bold hover:underline transition-all">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
