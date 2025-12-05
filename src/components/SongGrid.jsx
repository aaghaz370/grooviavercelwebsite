import { useContext } from "react";
import MusicContext from "../context/MusicContext";
import he from "he";

const SongGrid = ({
  name,
  artists,
  duration,
  downloadUrl,
  image,
  id,
  song, // yaha song == songList (queue) hai, same jaise baaki components me
}) => {
  const { playMusic } = useContext(MusicContext);

  const imageUrl = image?.[2]?.url || image || "/Unknown.png";

  const artistNames = Array.isArray(artists?.primary)
    ? artists.primary.map((artist) => artist.name).join(", ")
    : "Unknown Artist";

  // Safe audio URL nikal lo (array ho ya direct string)
  const audioUrl = Array.isArray(downloadUrl)
    ? downloadUrl[4]?.url || downloadUrl[0]?.url
    : downloadUrl;

  const convertTime = (seconds) => {
    if (!seconds || typeof seconds !== "number") return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  };

  return (
    <div
      className="group card flex items-center gap-3 min-w-[15rem] lg:min-w-[19rem] px-3 py-3 rounded-2xl cursor-pointer
                 hover:border-groovia-accent hover:bg-white/5 transition-all duration-300"
      onClick={() =>
        playMusic(audioUrl, name, duration, imageUrl, id, artists, song)
      }
    >
      {/* Left: Artwork */}
      <div className="flex-shrink-0">
        <img
          src={imageUrl}
          alt={name}
          className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl object-cover"
        />
      </div>

      {/* Middle: Title + Artist */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm lg:text-base truncate">
          {name ? he.decode(name) : "Empty"}
        </h3>
        <p className="text-xs lg:text-sm text-gray-400 truncate">
          {he.decode(artistNames)}
        </p>
      </div>

      {/* Right: Duration */}
      <span className="ml-2 text-xs lg:text-sm text-gray-400 flex-shrink-0">
        {convertTime(duration)}
      </span>
    </div>
  );
};

export default SongGrid;
