import { Link } from "react-router";
import he from "he";

const PlaylistItems = ({ name, image, id }) => {
  const imageUrl = image[2]?.url || image;

  return (
    <Link
      to={`/playlists/${id}`}
      className="playlist-card group lg:w-[12rem] w-[7rem] flex flex-col overflow-hidden hover:shadow-2xl cursor-pointer"
    >
      <div className="p-2">
        <img
          src={imageUrl || "/Unknown.png"}
          alt={name}
          className="rounded-2xl w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <div className="px-3 pb-3 flex justify-center items-center">
        <span className="font-semibold text-sm lg:text-base text-center truncate w-full group-hover:text-accent transition-colors">
          {name ? he.decode(name) : "Unnamed Playlist"}
        </span>
      </div>
    </Link>
  );
};

export default PlaylistItems;
