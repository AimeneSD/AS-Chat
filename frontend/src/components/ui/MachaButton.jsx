import { useState } from 'react';
import { Link } from 'react-router-dom';

const MachaButton = ({ label = "Label", href, to, extraClassName, onClick, type }) => {
  const [flairPos, setFlairPos] = useState({ x: 0, y: 0, scale: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFlairPos({ x, y, scale: 1 });
  };

  const handleMouseLeave = () => {
    setFlairPos((prev) => ({ ...prev, scale: 0 }));
  };

  const className = "relative text-sm font-bold " + extraClassName + " inline-flex items-center justify-center px-10 py-4 overflow-hidden tracking-wide text-green-200 bg-transparent border-2 border-green-700 rounded-full group transition-colors duration-300 hover:text-white";

  const children = (
    <>
      {/* La "bulle" (le flair) qui suit la souris */}
      <span
        className="absolute inset-0 z-0 pointer-events-none transition-transform duration-500 ease-out"
        style={{
          background: 'linear-gradient(114.41deg, #0ae448 20.74%, #abff84 65.5%)',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          left: flairPos.x - 250,
          top: flairPos.y - 250,
          transform: `scale(${flairPos.scale})`,
          zIndex: -1,
        }}
      />

      {/* Le texte du bouton */}
      <span className="relative z-10 uppercase">
        {label}
      </span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={className}
        style={{ isolation: 'isolate' }}
      >
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={className}
        style={{ isolation: 'isolate' }}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type || "button"}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ isolation: 'isolate' }}
    >
      {children}
    </button>
  );
};

export default MachaButton;