import { useContext } from "react";
import MusicContext from "../context/MusicContext";
import he from "he";

const TrendingCard = ({ name, artists, duration, downloadUrl, image, id, song }) => {
  const { playMusic } = useContext(MusicContext);

  const imageUrl = image[2]?.url || image;
  const artistNames = Array.isArray(artists?.primary)
    ? artists?.primary.map((artist) => artist.name).join(", ")
    : "Unknown Artist";

  downloadUrl = downloadUrl ? downloadUrl[4]?.url || downloadUrl : song.audio;

  return (
    <div
      className="group cursor-pointer transition-all duration-300 flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5"
      onClick={() =>
        playMusic(downloadUrl, name, duration, imageUrl, id, artists, song)
      }
    >
      {/* Thumbnail left – like YT Music list */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Text right */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-sm truncate text-white">
          {name ? he.decode(name) : "Empty"}
        </h3>
        <p className="text-xs text-gray-400 truncate font-normal">
          {he.decode(artistNames)}
        </p>
      </div>

      {/* Three-dot menu style icon on right */}
      <div className="ml-2 text-gray-400 text-xl opacity-0 group-hover:opacity-100 select-none">
        ⋮
      </div>
    </div>
  );
};

export default TrendingCard;
