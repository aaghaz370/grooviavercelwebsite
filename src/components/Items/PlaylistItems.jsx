import { Link } from "react-router";
import he from "he";

const PlaylistItems = ({ name, image, id }) => {
  const imageUrl = image[2]?.url || image;

  return (
    <Link
      to={`/playlists/${id}`}
      className="group cursor-pointer transition-all duration-300 flex-shrink-0 w-40 sm:w-44 md:w-48"
    >
      {/* Square Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl mb-2">
        <img
          src={imageUrl || "/Unknown.png"}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* 2-line fixed title */}
      <div className="px-0.5">
        <h3
          className="
            font-semibold 
            text-sm 
            lg:text-base 
            text-white 
            leading-tight
            line-clamp-2
            h-[40px]        /* Fix height so all cards equal */
            overflow-hidden 
          "
        >
          {name ? he.decode(name) : "Unnamed Playlist"}
        </h3>
      </div>
    </Link>
  );
};

export default PlaylistItems;
