// src/components/MoodPlaylistCard.jsx
import { Link } from "react-router-dom";

const MoodPlaylistCard = ({ id, name, description, moodTag, image }) => {
  const imageUrl = image?.[2]?.url || image?.[1]?.url || "/Unknown.png";

  return (
    <Link
      to={`/playlists/${id}`}
      className="
        relative 
        flex-shrink-0 
        w-full 
        lg:w-[480px]
        h-[290px]           /* ⬅️ height badha di */
        lg:h-[360px]        /* ⬅️ desktop pe thoda aur tall */
        rounded-3xl 
        overflow-hidden 
        bg-groovia-card
        hover:scale-[1.01]
        transition-transform 
        duration-300
      "
    >
      {/* Background image */}
      <img
        src={imageUrl}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-black/10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full px-4 py-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg lg:text-xl font-semibold tracking-tight">
            {name}
          </h3>
          {description && (
            <p className="text-xs lg:text-sm text-white/80 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {moodTag && (
          <p className="text-[11px] lg:text-xs italic text-white/85">
            {moodTag}
          </p>
        )}
      </div>
    </Link>
  );
};

export default MoodPlaylistCard;
