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
      className="group cursor-pointer transition-all duration-300"
      onClick={() =>
        playMusic(downloadUrl, name, duration, imageUrl, id, artists, song)
      }
    >
      {/* Square Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-lg mb-2">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      
      {/* Text Area - Compact */}
      <div className="px-1">
        <h3 className="font-bold text-sm truncate mb-0.5 text-white">
          {name ? he.decode(name) : "Empty"}
        </h3>
        <p className="text-xs text-gray-400 truncate font-normal">
          {he.decode(artistNames)}
        </p>
      </div>
    </div>
  );
};

export default TrendingCard;
