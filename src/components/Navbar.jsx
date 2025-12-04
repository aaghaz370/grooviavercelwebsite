import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar flex items-center justify-center top-0 z-20 fixed w-full px-4 lg:px-6 h-[4.5rem]">
      {/* Logo Only */}
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
    </nav>
  );
};

export default Navbar;
