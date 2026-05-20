import MachaButton from "../components/ui/MachaButton";

function Home() {
  return (
    <section className="flex justify-center items-center px-6 pt-24 sm:pt-28 md:pt-32 pb-16 min-h-[calc(100vh-80px)]" id="headhome">
      <div className="flex flex-col gap-y-8 w-full max-w-3xl text-center sm:text-left">
        <div className="flex flex-col gap-y-5">
          <h1 className="text-3xl hidden font-bold">AS-Chat</h1>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[0.95] tracking-tight">
            VOTRE MESSAGERIE DE DISCUSSION EN TEMPS RÉEL
          </h2>
          <p className="text-base sm:text-lg md:text-[22px] nunito-sans-font leading-relaxed font-normal text-white/90 max-w-xl mx-auto sm:mx-0">
            AS-Chat est l'application de messagerie instantanée qui permet aux utilisateurs de communiquer entre eux de manière rapide et sécurisée.
          </p>
        </div>
        <div className="flex justify-center sm:justify-start pt-4">
          <MachaButton label="Commencer" to="/login" extraClassName="!w-full sm:!w-64 !rounded-2xl text-white !text-[1.1rem]" />
        </div>
      </div>
    </section>
  );
}

export default Home;
