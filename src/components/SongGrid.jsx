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
  song,
}) => {
  const { playMusic } = useContext(MusicContext);

  const imageUrl = image?.[2]?.url || image || "/Unknown.png";

  const artistNames = Array.isArray(artists?.primary)
    ? artists.primary.map((artist) => artist.name).join(", ")
    : "Unknown Artist";

  // Safe audio URL (array ho ya string)
  const audioUrl = Array.isArray(downloadUrl)
    ? downloadUrl[4]?.url || downloadUrl[0]?.url
    : downloadUrl;

  return (
    <div
      onClick={() =>
        playMusic(audioUrl, name, duration, imageUrl, id, artists, song)
      }
      className="card group w-[8.3rem] lg:w-[9.5rem] flex-shrink-0 rounded-2xl overflow-hidden
                 bg-groovia-card/70 hover:bg-groovia-card border border-groovia-border
                 hover:border-groovia-accent cursor-pointer transition-all duration-300
                 hover:-translate-y-1 hover:shadow-groovia"
    >
      {/* Cover – same vibe as New Songs */}
      <div className="relative w-full aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Text area */}
      <div className="px-2 pt-2 pb-3 flex flex-col gap-1">
        <h3 className="font-semibold text-xs lg:text-sm truncate">
          {name ? he.decode(name) : "Empty"}
        </h3>
        <p className="text-[11px] lg:text-xs text-gray-400 truncate">
          {he.decode(artistNames)}
        </p>
      </div>
    </div>
  );
};

export default SongGrid;
