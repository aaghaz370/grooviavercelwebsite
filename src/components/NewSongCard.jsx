import { useContext } from "react";
import MusicContext from "../context/MusicContext";
import he from "he";

const NewSongCard = ({ name, artists, duration, downloadUrl, image, id, song }) => {
  const { playMusic } = useContext(MusicContext);

  const imageUrl = image[2]?.url || image;
  const artistNames = Array.isArray(artists?.primary)
    ? artists?.primary.map((artist) => artist.name).join(", ")
    : "Unknown Artist";

  downloadUrl = downloadUrl ? downloadUrl[4]?.url || downloadUrl : song.audio;

  return (
    <div
      className="card lg:w-[10.5rem] lg:h-[13rem] w-[8rem] h-[11rem] overflow-hidden p-2 rounded-xl cursor-pointer shadow-md hover:shadow-groovia transition-all duration-300"
      onClick={() =>
        playMusic(downloadUrl, name, duration, imageUrl, id, artists, song)
      }
    >
      <div className="relative group">
        <img
          src={imageUrl}
          alt={name}
          className="rounded-lg w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <div className="text-sm w-full flex flex-col gap-1 mt-2 px-1">
        <span className="font-semibold truncate text-sm">
          {name ? he.decode(name) : "Empty"}
        </span>
        <span className="text-xs text-gray-400 truncate">
          {he.decode(artistNames)}
        </span>
      </div>
    </div>
  );
};

export default NewSongCard;
