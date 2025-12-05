import { Link } from "react-router-dom";

const ArtistItems = ({ name, artists, id, image }) => {
  // Ensure 'artists' is an array and fallback if empty or undefined
  const artistNames = Array.isArray(artists?.primary)
    ? artists.primary.map((artist) => artist.name).join(" , ")
    : "";

  // Ensure image is an array with at least 3 elements, or provide a fallback image
  const imageUrl = image[2]?.url;

  return (
    <Link
      to={`/artists/${id}`}
      className="flex flex-col items-center justify-start gap-2 w-[5.5rem] lg:w-[7rem]"
    >
      {/* Bigger circular avatar like Spotify */}
      <img
        src={imageUrl || "/Unknown.png"}
        alt={name}
        className="w-16 h-16 lg:w-24 lg:h-24 rounded-full object-cover drop-shadow-lg transition-transform duration-200 ease-in-out hover:scale-105"
      />

      {/* Name + role */}
      <div className="flex flex-col items-center justify-center text-center">
        <span className="font-semibold text-[12px] lg:text-sm text-white truncate max-w-full">
          {name}
        </span>
        <span className="text-[10px] lg:text-xs text-white/50 tracking-wide">
          Artist
        </span>
      </div>
    </Link>
  );
};

export default ArtistItems;
