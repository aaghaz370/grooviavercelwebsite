import { Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import he from "he";

//import { fetchAlbumByID } from "../../fetch"; // path adjust kar lena agar alag ho
import { fetchAlbumByID } from "../../../fetch"; // ✅ root fetch.js
import MusicContext from "../../context/MusicContext";

const AlbumItems = ({ name, artists, id, image }) => {
  const { playMusic } = useContext(MusicContext);

  const [topSongs, setTopSongs] = useState([]);
  const [songCount, setSongCount] = useState(null);

  const artistNames = Array.isArray(artists?.primary)
    ? artists.primary.map((artist) => artist.name).join(", ")
    : "Various Artists";

  const imageUrl = image[2]?.url || image || "/Unknown.png";

  // Album ke 3 songs laao
  useEffect(() => {
    const loadAlbumSongs = async () => {
      try {
        const data = await fetchAlbumByID(id);
        const albumData = data?.data || data; // backend ke hisaab se adjust kar sakte ho
        const songs = albumData?.songs || [];
        setTopSongs(songs.slice(0, 3));
        setSongCount(songs.length);
      } catch (err) {
        console.error("Error fetching album songs:", err);
      }
    };

    if (id) loadAlbumSongs();
  }, [id]);

  const handleSongClick = (song) => {
    if (!song) return;

    const songImage =
      song.image?.[2]?.url || song.image?.[0]?.url || imageUrl;

    const songArtists = song.artists || artists;
    const duration = song.duration || 0;

    let downloadUrl = song.downloadUrl;
    downloadUrl = downloadUrl
      ? downloadUrl[4]?.url || downloadUrl[0]?.url || downloadUrl
      : song.audio;

    playMusic(
      downloadUrl,
      song.name,
      duration,
      songImage,
      song.id,
      songArtists,
      song
    );
  };

  return (
    <div className="relative rounded-3xl overflow-hidden min-h-[230px] lg:min-h-[260px]">
      {/* Blurred album background */}
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover blur-2xl scale-110"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col gap-4 p-4 lg:p-5">
        {/* Top section: cover + text + button */}
        <div className="flex gap-4 items-center">
          <Link
            to={`/albums/${id}`}
            className="flex-shrink-0 rounded-xl overflow-hidden w-16 h-16 lg:w-20 lg:h-20"
          >
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          </Link>

          <div className="flex flex-col justify-center min-w-0">
            <Link to={`/albums/${id}`} className="hover:underline">
              <h3 className="text-lg lg:text-xl font-semibold text-white truncate">
                {name ? he.decode(name) : "Unknown Album"}
              </h3>
            </Link>
            <p className="text-sm text-white/80 truncate">
              {he.decode(artistNames)}
            </p>
            <p className="text-xs text-white/60 mt-0.5">
              {songCount ? `${songCount} songs` : "Album"}
            </p>
          </div>

          <Link
            to={`/albums/${id}`}
            className="ml-auto rounded-full bg-white/15 hover:bg-white/25 backdrop-blur px-4 py-2 text-sm font-semibold text-white hidden sm:inline-flex"
          >
            View
          </Link>
        </div>

        {/* 3-song preview list */}
        <div className="flex flex-col gap-2 mt-1">
          {topSongs.map((song) => {
            const songArtistNames = Array.isArray(song?.artists?.primary)
              ? song.artists.primary.map((a) => a.name).join(", ")
              : artistNames;

            return (
              <button
                key={song.id}
                onClick={() => handleSongClick(song)}
                className="flex flex-col items-start text-left px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-sm font-medium text-white truncate w-full">
                  {song?.name ? he.decode(song.name) : "Unknown Track"}
                </span>
                <span className="text-xs text-white/60 truncate w-full">
                  {he.decode(songArtistNames)}
                </span>
              </button>
            );
          })}

          {/* Agar 3 songs kam ho to bhi layout stable rahe */}
          {topSongs.length === 0 && (
            <span className="text-xs text-white/40">
              Songs preview not available.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlbumItems;
