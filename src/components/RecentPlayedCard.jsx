import { useContext } from "react";
import MusicContext from "../context/MusicContext";
import he from "he";
import { FaPlay } from "react-icons/fa";

const RecentPlayedCard = ({ name, artists, duration, downloadUrl, image, id, song }) => {
  const { playMusic } = useContext(MusicContext);

  const imageUrl = image[2]?.url || image;
  const artistNames = Array.isArray(artists?.primary)
    ? artists?.primary.map((artist) => artist.name).join(", ")
    : "Unknown Artist";

  downloadUrl = downloadUrl ? downloadUrl[4]?.url || downloadUrl : song.audio;

  return (
    <div
      className="group relative cursor-pointer rounded-xl overflow-hidden bg-groovia-card border border-groovia-border hover:border-groovia-accent transition-all duration-300 hover:shadow-groovia"
      onClick={() =>
        playMusic(downloadUrl, name, duration, imageUrl, id, artists, song)
      }
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-groovia-accent rounded-full p-4 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
            <FaPlay className="text-white text-xl" />
          </div>
        </div>

        {/* Song Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <h3 className="font-semibold text-sm truncate mb-1">
            {name ? he.decode(name) : "Empty"}
          </h3>
          <p className="text-xs text-gray-300 truncate">
            {he.decode(artistNames)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecentPlayedCard;
