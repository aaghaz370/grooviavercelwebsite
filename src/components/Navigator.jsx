import { NavLink } from "react-router-dom";
import { IoSearchOutline } from "react-icons/io5";
import { MdHomeFilled, MdOutlineLibraryMusic } from "react-icons/md";
import { FaHeart } from "react-icons/fa";

const Navigator = () => {
  return (
    <nav className="Navigator fixed bottom-0 left-0 right-0 z-30 flex justify-around items-center h-14 lg:hidden">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${
            isActive ? "text-groovia-accent" : "text-gray-400"
          }`
        }
      >
        <MdHomeFilled className="text-2xl" />
        <span className="text-xs font-medium">Home</span>
      </NavLink>

      <NavLink
        to="/Browse"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${
            isActive ? "text-groovia-accent" : "text-gray-400"
          }`
        }
      >
        <IoSearchOutline className="text-2xl" />
        <span className="text-xs font-medium">Search</span>
      </NavLink>

      <NavLink
        to="/Music"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${
            isActive ? "text-groovia-accent" : "text-gray-400"
          }`
        }
      >
        <FaHeart className="text-2xl" />
        <span className="text-xs font-medium">My Music</span>
      </NavLink>
    </nav>
  );
};

export default Navigator;
