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

  downloadUrl = downloadUrl ? downloadUrl[4]?.url || downloadUrl : (song?.audio || downloadUrl);

  return (
    <div
      className="group relative cursor-pointer rounded-xl overflow-hidden bg-groovia-card border border-groovia-border hover:border-groovia-accent transition-all duration-300 hover:shadow-groovia"
      onClick={() =>
        playMusic(downloadUrl, name, duration, imageUrl, id, artists, song)
      }
      style={{ aspectRatio: '1/1', width: '100%' }}
    >
      {/* Image - Full Card Background */}
      <img
        src={imageUrl}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      
      {/* Play Button - Center */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <div className="bg-groovia-accent rounded-full p-3 shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
          <FaPlay className="text-white text-xl" />
        </div>
      </div>

      {/* Song Info - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-3 text-white z-10">
        <h3 className="font-semibold text-xs lg:text-sm truncate mb-0.5">
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
