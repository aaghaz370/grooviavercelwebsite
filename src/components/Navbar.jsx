// src/components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="navbar fixed top-0 z-20 w-full h-[4.5rem] px-4 lg:px-6 flex items-center justify-between">
      {/* LEFT: Logo */}
      <Link to="/" className="flex items-center gap-2">
        {/* Neon G logo */}
        <img
          src="/groovia-logo.svg"
          alt="Groovia"
          className="w-9 h-9 lg:w-10 lg:h-10 rounded-full shadow-[0_0_18px_rgba(208,64,255,0.9)]"
        />

        {/* Wordmark */}
        <div className="flex items-baseline gap-[2px]">
          <span className="Musi font-extrabold text-2xl lg:text-3xl">
            Groo
          </span>
          <span className="fy font-extrabold text-2xl lg:text-3xl">
            via
          </span>
        </div>
      </Link>

      {/* RIGHT: Desktop nav (hidden on mobile) */}
      <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
        <Link
          to="/Browse"
          className={`transition-colors ${
            isActive("/search")
              ? "text-white"
              : "text-gray-300 hover:text-white"
          }`}
        >
          Search
        </Link>

        <Link
          to="/Music"
          className={`transition-colors ${
            isActive("/myMusic")
              ? "text-white"
              : "text-gray-300 hover:text-white"
          }`}
        >
          My Music
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
