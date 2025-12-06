// src/components/CommunityPlaylistCard.jsx
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import MusicContext from "../context/MusicContext";

const CommunityPlaylistCard = ({ config, playlistData }) => {
  const navigate = useNavigate();
  const { playMusic } = useContext(MusicContext);

  const songs = playlistData?.songs || playlistData?.data?.songs || [];
  const top4 = songs.slice(0, 4);
  const top3 = songs.slice(0, 3);

  const handleOpenPlaylist = () => {
    if (!config?.id) return;
    navigate(`/playlists/${config.id}`);
  };

  const handlePlaySong = (e, song) => {
    e.stopPropagation();
    if (!song) return;

    const audioSource = song.downloadUrl
      ? song.downloadUrl[4]?.url || song.downloadUrl[0]?.url || song.downloadUrl
      : song.audio;

    const { name, duration, image, id, artists } = song;

    if (!audioSource) return;

    playMusic(
      audioSource,
      name,
      duration,
      image,
      id,
      artists,
      songs // full playlist queue
    );
  };

  return (
    <button
      onClick={handleOpenPlaylist}
      className="
        flex flex-col
        w-[88vw] lg:w-[480px]
        rounded-3xl
        overflow-hidden
        text-left
        bg-gradient-to-br
        from-[#111827] to-[#020617]
        shadow-lg
        relative
        focus:outline-none
        hover:scale-[1.01]
        transition-transform duration-300
      "
      style={{
        backgroundImage: `linear-gradient(to bottom right, ${config.from}, ${config.to})`,
      }}
    >
      {/* TOP: collage + title */}
      <div className="flex gap-4 p-4">
        {/* 4-image collage */}
        <div className="w-20 h-20 rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 flex-shrink-0">
          {top4.map((s, idx) => (
            <img
              key={s.id || idx}
              src={s.image?.[1]?.url || s.image?.[0]?.url || "/Unknown.png"}
              alt={s.name}
              className="w-full h-full object-cover"
            />
          ))}
          {top4.length === 0 && (
            <div className="w-full h-full bg-black/30" />
          )}
        </div>

        {/* text */}
        <div className="flex flex-col justify-center gap-1 overflow-hidden">
          <h3 className="text-lg lg:text-xl font-semibold truncate">
            {config.title}
          </h3>
          <p className="text-xs lg:text-sm text-white/80 truncate">
            {config.owner}
          </p>
          <p className="text-xs lg:text-sm text-white/60">
            {config.songCountLabel || `${songs.length} songs`}
          </p>
        </div>
      </div>

      {/* MIDDLE: first 3 songs list */}
      <div className="px-4 pb-3 flex flex-col gap-2">
        {top3.map((song) => (
          <div
            key={song.id}
            onClick={(e) => handlePlaySong(e, song)}
            className="
              flex items-center justify-between
              rounded-2xl
              bg-black/20
              px-3 py-2
              cursor-pointer
              hover:bg-black/30
              transition-colors
            "
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src={
                  song.image?.[1]?.url ||
                  song.image?.[0]?.url ||
                  "/Unknown.png"
                }
                alt={song.name}
                className="w-10 h-10 rounded-md object-cover flex-shrink-0"
              />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">
                  {song.name}
                </span>
                <span className="text-[11px] text-white/70 truncate">
                  {song.artists?.primary
                    ?.map((a) => a.name)
                    .join(", ") || "Unknown Artist"}
                </span>
              </div>
            </div>

            {/* 3 dots hata diye – sirf yeh blank space rakh diya thoda balance ke liye */}
            <span className="w-4 h-4" />
          </div>
        ))}

        {top3.length === 0 && (
          <p className="text-xs text-white/60">Loading songs…</p>
        )}
      </div>

      {/* BOTTOM: single PLAY button (redirect to playlist page) */}
      <div className="px-4 pb-4 pt-1">
        <div className="flex items-center justify-start gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenPlaylist();
            }}
            className="
              w-10 h-10
              rounded-full
              bg-white text-black
              flex items-center justify-center
              shadow-md
              active:scale-95
              transition-transform
            "
          >
            ▶
          </button>
          <span className="text-xs text-white/70">
            View full playlist
          </span>
        </div>
      </div>
    </button>
  );
};

export default CommunityPlaylistCard;
