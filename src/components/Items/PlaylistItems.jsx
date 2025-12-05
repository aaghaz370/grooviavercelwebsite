import { Link } from "react-router";
import he from "he";

const PlaylistItems = ({ name, image, id }) => {
  const imageUrl = image[2]?.url || image;

  return (
    <Link
      to={`/playlists/${id}`}
      className="group cursor-pointer transition-all duration-300"
    >
      {/* Large Square Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl mb-3">
        <img
          src={imageUrl || "/Unknown.png"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      
      {/* Playlist Name */}
      <div className="px-1">
        <h3 className="font-bold text-sm lg:text-base truncate text-white">
          {name ? he.decode(name) : "Unnamed Playlist"}
        </h3>
      </div>
    </Link>
  );
};

export default PlaylistItems;
