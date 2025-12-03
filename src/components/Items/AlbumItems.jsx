import { Link } from "react-router-dom";
import he from "he";

const AlbumItems = ({ name, artists, id, image }) => {
  const artistNames = Array.isArray(artists?.primary)
    ? artists.primary.map((artist) => artist.name).join(", ")
    : "";

  const imageUrl = image[2]?.url || image;

  return (
    <Link
      to={`/albums/${id}`}
      className="album-card group lg:w-[11rem] lg:h-[14rem] w-[8.5rem] h-[12rem] overflow-hidden border border-transparent hover:border-accent shadow-lg cursor-pointer"
    >
      <div className="relative p-2">
        <img
          src={imageUrl || "/Unknown.png"}
          alt={name}
          className="rounded-xl w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      </div>
      
      <div className="px-3 pb-2 text-sm flex flex-col gap-1">
        <span className="font-semibold truncate text-white group-hover:text-accent transition-colors">
          {name ? he.decode(name) : "Empty"}
        </span>
        <span className="text-xs text-gray-400 truncate">
          {artistNames ? he.decode(artistNames) : "Various Artists"}
        </span>
      </div>
    </Link>
  );
};

export default AlbumItems;
