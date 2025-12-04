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
      className="group relative cursor-pointer rounded-xl overflow-hidden bg-groovia-card border border-groovia-border hover:border-groovia-accent transition-all duration-300 hover:shadow-groovia"
      onClick={() =>
        playMusic(downloadUrl, name, duration, imageUrl, id, artists, song)
      }
      style={{ aspectRatio: '16/9', width: '100%' }}
    >
      {/* Background Image */}
      <img
        src={imageUrl}
        alt={name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      {/* Song Info - Bottom Left */}
      <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 text-white z-10">
        <h3 className="font-bold text-base lg:text-xl truncate mb-1">
          {name ? he.decode(name) : "Empty"}
        </h3>
        <p className="text-xs lg:text-sm text-gray-300 truncate">
          {he.decode(artistNames)}
        </p>
      </div>
    </div>
  );
};

export default TrendingCard;
