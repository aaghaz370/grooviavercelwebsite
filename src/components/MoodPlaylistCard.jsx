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
        lg:w-[520px]
        rounded-3xl 
        overflow-hidden 
        bg-groovia-card
        hover:scale-[1.01]
        transition-transform 
        duration-300
      "
    >
      {/* Aspect-ratio wrapper: mobile ~3:4, desktop ~2:3 */}
      <div className="relative w-full h-0 pb-[80%] lg:pb-[65%]">
        {/* Background image – full image visible, no cutting */}
        <img
          src={imageUrl}
          alt={name}
          className="
            absolute inset-0 
            w-full h-full 
            object-contain
          "
        />

        {/* Soft overlay like YT Music */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/45 to-black/10" />

        {/* Text content */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between px-4 py-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg lg:text-xl font-semibold tracking-tight">
              {name}
            </h3>

            {description && (
              <p className="text-xs lg:text-sm text-white/80 leading-snug">
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
      </div>
    </Link>
  );
};

export default MoodPlaylistCard;
