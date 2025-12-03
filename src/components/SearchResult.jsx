import { useContext } from "react";
import MusicContext from "../context/MusicContext";
import he from "he";
import { FaPlay } from "react-icons/fa";

const SearchResultCard = ({ name, artists, duration, downloadUrl, image, id, song }) => {
  const { playMusic } = useContext(MusicContext);

  const imageUrl = image[2]?.url || image;
  const artistNames = Array.isArray(artists?.primary)
    ? artists?.primary.map((artist) => artist.name).join(", ")
    : "Unknown Artist";

  downloadUrl = downloadUrl ? downloadUrl[4]?.url || downloadUrl : song?.audio;

  const convertTime = (seconds) => {
    if (!seconds || typeof seconds !== "number") return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  };

  return (
    <div
      className="card group w-full p-3 rounded-xl cursor-pointer hover:border-groovia-accent transition-all duration-300 flex items-center gap-4"
      onClick={() =>
        playMusic(downloadUrl, name, duration, imageUrl, id, artists, song)
      }
    >
      {/* Album Art */}
      <div className="relative flex-shrink-0">
        <img
          src={imageUrl}
          alt={name}
          className="w-16 h-16 lg:w-20 lg:h-20 rounded-lg object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 rounded-lg">
          <FaPlay className="text-white text-xl" />
        </div>
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base lg:text-lg truncate mb-1">
          {name ? he.decode(name) : "Empty"}
        </h3>
        <p className="text-sm text-gray-400 truncate">
          {he.decode(artistNames)}
        </p>
      </div>

      {/* Duration */}
      <span className="text-sm text-gray-500 hidden lg:block">
        {convertTime(duration)}
      </span>
    </div>
  );
};

export default SearchResultCard;
