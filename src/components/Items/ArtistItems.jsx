import { Link } from "react-router-dom";

const ArtistItems = ({ name, artists, id, image }) => {
  const imageUrl = image[2]?.url || "/Unknown.png";

  return (
    <Link
      to={`/artists/${id}`}
      className="flex flex-col items-center justify-start w-[6.2rem] lg:w-[7.5rem]"
    >
      {/* Spotify-sized large circular image */}
      <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden shadow-md">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
        />
      </div>

      {/* Artist Name */}
      <span className="mt-2 font-semibold text-[13px] lg:text-sm text-white text-center truncate w-full">
        {name}
      </span>

      {/* Faded Role (Spotify style) */}
      <span className="text-[11px] lg:text-xs text-white/40 text-center">
        Artist
      </span>
    </Link>
  );
};

export default ArtistItems;
