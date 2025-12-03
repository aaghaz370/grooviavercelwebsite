import { useContext } from "react";
import MusicContext from "../context/MusicContext";
import he from "he";
import { FaPlay } from "react-icons/fa";

const SongGrid = ({ name, artists, duration, downloadUrl, image, id, song }) => {
  const { playMusic } = useContext(MusicContext);

  const imageUrl = image[2]?.url || image;
  const artistNames = Array.isArray(artists?.primary)
    ? artists?.primary.map((artist) => artist.name).join(", ")
    : "Unknown Artist";

  downloadUrl = downloadUrl ? downloadUrl[4]?.url || downloadUrl : song.audio;

  const convertTime = (seconds) => {
    if (!seconds || typeof seconds !== "number") {
      return "0:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  };

  return (
    <div
      className="trending-card group relative lg:w-[16rem] lg:h-[5rem] w-[10rem] h-[4rem] p-2 cursor-pointer overflow-hidden"
      onClick={() =>
        playMusic(downloadUrl, name, duration, imageUrl, id, artists, song)
      }
    >
      <div className="flex items-center gap-3 h-full">
        {/* Album Art */}
        <div className="relative flex-shrink-0">
          <img
            src={imageUrl}
            alt={name}
            className="lg:w-[4rem] lg:h-[4rem] w-[3rem] h-[3rem] rounded-lg object-cover transition-all duration-300 group-hover:brightness-75"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FaPlay className="text-white text-xl drop-shadow-lg" />
          </div>
        </div>

        {/* Song Info */}
        <div className="flex flex-col justify-center overflow-hidden flex-1 min-w-0">
          <span className="font-semibold text-sm lg:text-base truncate">
            {name ? he.decode(name) : "Empty"}
          </span>
          <span className="text-xs text-gray-400 truncate">
            {he.decode(artistNames)}
          </span>
        </div>

        {/* Duration */}
        <span className="text-xs text-gray-500 hidden lg:block">
          {convertTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default SongGrid;
