import MachaButton from "../components/ui/MachaButton";
import { Link } from 'react-router-dom';

function Login() {
  return (
    <div className="grow flex items-center justify-center">
      <div className="bg-[#a4f3a6]/95 lg:w-[25vw] w-[85vw] h-fit flex flex-col items-center rounded-2xl backdrop-blur-sm p-8 shadow-2xl border border-white/20">
        <div className="flex flex-col gap-y-8 text-center w-full">
          <h1 className="text-3xl text-white font-bold tracking-tight">Se connecter</h1>
          
          <div className="w-full">
            <form className="mt-4 flex flex-col gap-6 w-full">
              {/* Email */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-black/80 font-semibold text-sm ml-1" htmlFor="email">E-mail <span className="text-red-500">*</span></label>
                <input type="email" placeholder="votre@email.com" className="border-0 bg-white/40 backdrop-blur-md p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder:text-black/40 text-black" />
              </div>

              {/* Mot de passe */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-black/80 font-semibold text-sm ml-1" htmlFor="password">Mot de passe <span className="text-red-500">*</span></label>
                <input type="password" placeholder="Votre mot de passe" className="border-0 bg-white/40 backdrop-blur-md p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all placeholder:text-black/40 text-black" />
              </div>

              <div className="pt-2">
                <MachaButton label="Connexion" to="/login" extraClassName="!w-full !rounded-2xl text-white !text-[1.1rem] !py-3.5 shadow-lg" />
              </div>
            </form>
            
            <p className="pt-6 text-black/70 text-sm">
              Vous n'avez pas de compte ? <Link to="/signup" className="text-white font-bold hover:underline transition-all">Inscrivez-vous</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
