import { useContext } from "react";
import MusicContext from "../context/MusicContext";
import he from "he";
import { FaPlay } from "react-icons/fa";

const TrendingCard = ({ name, artists, duration, downloadUrl, image, id, song }) => {
  const { playMusic } = useContext(MusicContext);

  const imageUrl = image[2]?.url || image;
  const artistNames = Array.isArray(artists?.primary)
    ? artists?.primary.map((artist) => artist.name).join(", ")
    : "Unknown Artist";

  downloadUrl = downloadUrl ? downloadUrl[4]?.url || downloadUrl : song.audio;

  const convertTime = (seconds) => {
    if (!seconds || typeof seconds !== "number") return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  };

  return (
    <div
      className="card group lg:w-[18rem] w-[15rem] h-[4.5rem] p-2 rounded-xl cursor-pointer hover:border-groovia-accent transition-all duration-300 flex items-center gap-3"
      onClick={() =>
        playMusic(downloadUrl, name, duration, imageUrl, id, artists, song)
      }
    >
      <div className="relative flex-shrink-0">
        <img
          src={imageUrl}
          alt={name}
          className="lg:w-[3.5rem] lg:h-[3.5rem] w-[3rem] h-[3rem] rounded-lg object-cover transition-all duration-300"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 rounded-lg">
          <FaPlay className="text-white text-lg" />
        </div>
      </div>

      <div className="flex flex-col justify-center overflow-hidden flex-1 min-w-0">
        <span className="font-semibold text-sm truncate">
          {name ? he.decode(name) : "Empty"}
        </span>
        <span className="text-xs text-gray-400 truncate">
          {he.decode(artistNames)}
        </span>
      </div>

      <span className="text-xs text-gray-500 hidden lg:block">
        {convertTime(duration)}
      </span>
    </div>
  );
};

export default TrendingCard;
