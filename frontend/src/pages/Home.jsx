import MachaButton from "../components/ui/MachaButton";

function Home() {
  return (
    <section className="flex justify-center items-center pt-30" id="headhome">
      <div className="flex flex-col text- gap-y-6 max-w-[70vw]">
        <div className="flex flex-col max-w-[50%] pr-16 gap-y-4">
          <h1 className="text-3xl hidden font-bold">AS-Chat</h1>
          <h2 className="text-6xl font-extrabold leading-[0.95]">VOTRE MESSAGERIE DE DISCUSSION EN TEMPS RÉEL</h2>
          <p className="text-[22px] nunito-sans-font leading-[1.2] font-normal">AS-Chat est l'application de messagerie instantanée qui permet aux utilisateurs de communiquer entre eux de manière rapide et sécurisée.</p>
        </div>
        <div className="flex justify-center pt-26 pb-16">
          <MachaButton label="Commencer" to="/login" extraClassName="!w-70 !rounded-2xl text-white  !text-[1.2rem]" />
        </div>
      </div>
    </section>

  );
}

export default Home;
