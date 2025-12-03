import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar flex items-center justify-between top-0 z-20 fixed w-full px-4 lg:px-6 h-[4.5rem]">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <span className="bg"></span>
        <div>
          <span className="Musi font-extrabold text-2xl lg:text-3xl">
            Groo
          </span>
          <span className="fy font-extrabold text-2xl lg:text-3xl">
            via
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="flex gap-8 font-semibold">
        <Link to="/Browse" className="hover:text-accent transition-colors">
          <h2 className="text-lg lg:text-xl">Browse</h2>
        </Link>
        <Link to="/Music" className="hover:text-accent transition-colors">
          <h2 className="text-lg lg:text-xl">My Music</h2>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
