import { useContext } from "react";
import MusicContext from "../context/MusicContext";
import he from "he";

const RecentPlayedCard = ({
  name,
  artists,
  duration,
  downloadUrl,
  image,
  id,
  song,
}) => {
  const { playMusic } = useContext(MusicContext);

  const imageUrl = image[2]?.url || image;
  const artistNames = Array.isArray(artists?.primary)
    ? artists?.primary.map((artist) => artist.name).join(", ")
    : "Unknown Artist";

  downloadUrl = downloadUrl
    ? downloadUrl[4]?.url || downloadUrl
    : song?.audio || downloadUrl;

  return (
    <div
      className="
        group relative z-0 
        cursor-pointer 
        rounded-2xl 
        overflow-hidden 
        border border-transparent 
        bg-groovia-card 
        transition-all duration-300 
        hover:border-white/90 hover:bg-white/5
      "
      onClick={() =>
        playMusic(downloadUrl, name, duration, imageUrl, id, artists, song)
      }
      style={{ aspectRatio: "1 / 1", width: "100%" }} // 3×2 grid ke liye square
    >
      {/* Full image background */}
      <img
        src={imageUrl}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Bottom gradient like YT dial cards */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/5" />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-2.5 lg:p-3">
        <h3 className="font-semibold text-xs lg:text-sm truncate mb-0.5 text-white">
          {name ? he.decode(name) : "Empty"}
        </h3>
        <p className="text-[10px] lg:text-xs text-gray-300 truncate">
          {he.decode(artistNames)}
        </p>
      </div>
    </div>
  );
};

export default RecentPlayedCard;
