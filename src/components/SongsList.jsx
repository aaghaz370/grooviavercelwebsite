import { useContext } from "react";
import MusicContext from "../context/MusicContext";
import he from "he";

const SongsList = ({
  name,
  artists,
  duration,
  downloadUrl,
  image,
  id,
  song, // full list for queue
}) => {
  const { playMusic } = useContext(MusicContext);

  const imageUrl = image?.[2]?.url || image;
  const artistNames = Array.isArray(artists?.primary)
    ? artists.primary.map((a) => a.name).join(", ")
    : "Unknown Artist";

  // same pattern as baaki components
  const audioSrc = downloadUrl
    ? downloadUrl[4]?.url || downloadUrl
    : song?.audio || downloadUrl;

  const convertTime = (seconds) => {
    if (!seconds || typeof seconds !== "number") return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handlePlay = () => {
    playMusic(audioSrc, name, duration, image, id, artists, song);
  };

  return (
    <div
      className="
        card
        w-full
        px-3 lg:px-5
        py-3.5 lg:py-4
        flex items-center
        gap-3 lg:gap-4
        rounded-2xl
        cursor-pointer
        hover:bg-white/5
        transition-all duration-200
      "
      onClick={handlePlay}
    >
      {/* Cover */}
      <div className="relative flex-shrink-0">
        <img
          src={imageUrl || "/Unknown.png"}
          alt={name}
          className="w-12 h-12 lg:w-14 lg:h-14 rounded-lg object-cover"
        />
      </div>

      {/* Title + artist */}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="font-semibold text-sm lg:text-base truncate text-white">
          {name ? he.decode(name) : "Empty"}
        </span>
        <span className="text-xs lg:text-sm text-gray-400 truncate mt-0.5">
          {he.decode(artistNames)}
        </span>
      </div>

      {/* Duration right side */}
      <div className="ml-2 flex-shrink-0">
        <span className="text-xs lg:text-sm text-gray-300">
          {convertTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default SongsList;
