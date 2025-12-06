import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Player from "../components/Player";
import Navigator from "../components/Navigator";
import MusicContext from "../context/MusicContext";

import { BsThreeDotsVertical } from "react-icons/bs";
import { FaPlay } from "react-icons/fa";

const MyPlaylist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playMusic } = useContext(MusicContext);

  const [playlist, setPlaylist] = useState(null);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState([]);

  // load playlists + liked songs
  useEffect(() => {
    const storedLiked = JSON.parse(localStorage.getItem("likedSongs")) || [];
    const storedCustom =
      JSON.parse(localStorage.getItem("customPlaylists")) || [];

    setLikedSongs(storedLiked);

    // migrate data (agar old format ho)
    const migrated = (storedCustom || []).map((pl) => {
      if (pl.songs && Array.isArray(pl.songs)) return pl;
      if (pl.songIds && Array.isArray(pl.songIds)) {
        const songs = storedLiked.filter((s) => pl.songIds.includes(s.id));
        return {
          id: pl.id,
          name: pl.name,
          createdAt: pl.createdAt || Date.now(),
          songs,
        };
      }
      return {
        id: pl.id,
        name: pl.name,
        createdAt: pl.createdAt || Date.now(),
        songs: [],
      };
    });

    setAllPlaylists(migrated);

    const found = migrated.find(
      (pl) => String(pl.id) === String(id)
    );
    setPlaylist(found || null);

    localStorage.setItem("customPlaylists", JSON.stringify(migrated));
  }, [id]);

  const savePlaylists = (updated) => {
    setAllPlaylists(updated);
    localStorage.setItem("customPlaylists", JSON.stringify(updated));
  };

  const updateCurrentPlaylist = (updatedPlaylist) => {
    setPlaylist(updatedPlaylist);
    const updatedAll = allPlaylists.map((pl) =>
      pl.id === updatedPlaylist.id ? updatedPlaylist : pl
    );
    savePlaylists(updatedAll);
  };

  const playTrack = (song) => {
    if (!playlist) return;
    playMusic(
      song.audio,
      song.name,
      song.duration,
      song.image,
      song.id,
      playlist.songs
    );
  };

  const handleRemoveSong = (songId) => {
    if (!playlist) return;
    const newSongs = playlist.songs.filter((s) => s.id !== songId);
    updateCurrentPlaylist({ ...playlist, songs: newSongs });
    setOpenMenuId(null);
  };

  const toggleSelectAddSong = (id) => {
    setSelectedToAdd((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddSongs = () => {
    if (!playlist) return;
    if (selectedToAdd.length === 0) {
      setIsAddModalOpen(false);
      return;
    }

    const existingIds = playlist.songs.map((s) => s.id);
    const toAdd = likedSongs
      .filter(
        (s) =>
          selectedToAdd.includes(s.id) && !existingIds.includes(s.id)
      )
      .map((s) => ({ ...s }));

    const newSongs = [...playlist.songs, ...toAdd];
    updateCurrentPlaylist({ ...playlist, songs: newSongs });

    setSelectedToAdd([]);
    setIsAddModalOpen(false);
  };

  if (!playlist) {
    return (
      <>
        <Navbar />
        <div className="mt-[8rem] px-6 text-sm">
          Playlist not found.
          <button
            onClick={() => navigate("/my-music")}
            className="ml-2 underline"
          >
            Go back
          </button>
        </div>
        <Player />
        <Navigator />
      </>
    );
  }

  const cover = playlist.songs?.[0]?.image || "/Unknown.png";

  const otherPlaylists = allPlaylists.filter(
    (pl) => pl.id !== playlist.id
  );

  return (
    <>
      <Navbar />

      <div className="flex flex-col mb-[12rem] gap-4 px-[1.6rem] lg:px-[3rem] mt-[8.5rem] lg:mt-[6rem]">
        {/* Header */}
        <div className="flex gap-4 items-center">
          <div className="h-[5rem] w-[5rem] lg:h-[6rem] lg:w-[6rem] rounded-xl overflow-hidden">
            <img
              src={cover}
              alt={playlist.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.16em] opacity-70">
              Custom playlist
            </span>
            <h1 className="text-xl lg:text-2xl font-semibold">
              {playlist.name}
            </h1>
            <span className="text-xs opacity-70">
              {playlist.songs.length} song
              {playlist.songs.length > 1 ? "s" : ""} • Tap a song to play
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1">
          <button
            onClick={() => navigate(-1)}
            className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15"
          >
            Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15"
            >
              Add songs
            </button>
            {playlist.songs.length > 0 && (
              <button
                onClick={() => playTrack(playlist.songs[0])}
                className="text-xs px-3.5 py-1.5 rounded-full bg-white text-black font-semibold hover:opacity-90 flex items-center gap-1"
              >
                <FaPlay className="text-[0.7rem]" />
                Play
              </button>
            )}
          </div>
        </div>

        {/* SONG LIST */}
        <div className="mt-3 flex flex-col gap-1">
          {playlist.songs.length === 0 && (
            <div className="text-xs opacity-70">
              No songs yet. Use “Add songs” to add from liked songs.
            </div>
          )}

          {playlist.songs.map((song) => (
            <div
              key={song.id}
              className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-white/5"
            >
              <div
                className="flex items-center gap-3 flex-1 min-w-0"
                onClick={() => playTrack(song)}
              >
                <img
                  src={song.image}
                  alt={song.name}
                  className="h-9 w-9 rounded-md object-cover"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold truncate">
                    {song.name}
                  </span>
                  <span className="text-[0.7rem] opacity-70 truncate">
                    {(song.artists?.primary || [])
                      .map((a) => a.name)
                      .join(", ")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-2 relative">
                <span className="text-[0.7rem] opacity-70">
                  {song.duration
                    ? new Date(song.duration * 1000)
                        .toISOString()
                        .substring(14, 19)
                    : ""}
                </span>
                <button
                  onClick={() =>
                    setOpenMenuId(
                      openMenuId === song.id ? null : song.id
                    )
                  }
                  className="p-1 rounded-full hover:bg-white/10"
                >
                  <BsThreeDotsVertical />
                </button>
                {openMenuId === song.id && (
                  <div className="absolute right-0 top-8 w-32 bg-[#111827] rounded-xl border border-white/10 shadow-lg text-xs z-20">
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-white/10"
                      onClick={() => {
                        playTrack(song);
                        setOpenMenuId(null);
                      }}
                    >
                      Play
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 hover:bg-white/10 text-red-300"
                      onClick={() => handleRemoveSong(song.id)}
                    >
                      Remove from playlist
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Other playlists */}
        {otherPlaylists.length > 0 && (
          <div className="mt-4">
            <h2 className="text-sm font-semibold mb-2">
              Other playlists
            </h2>
            <div className="flex flex-wrap gap-3">
              {otherPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  className="w-[47%] sm:w-[31%] md:w-[23%] lg:w-[18%] min-w-[130px] flex flex-col gap-1 cursor-pointer"
                  onClick={() => navigate(`/my-playlists/${pl.id}`)}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-white/5">
                    <img
                      src={pl.songs?.[0]?.image || "/Unknown.png"}
                      alt={pl.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-semibold truncate">
                    {pl.name}
                  </span>
                  <span className="text-xs opacity-70">
                    {pl.songs.length} song
                    {pl.songs.length > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ADD SONGS MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#09090B] w-[95%] max-w-[550px] max-h-[80vh] rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex flex-col">
                <span className="text-xs opacity-70 uppercase tracking-[0.16em]">
                  Add songs
                </span>
                <h2 className="text-lg font-semibold">
                  Add from liked songs
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 hover:bg-white/15"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto max-h-[55vh] pr-1">
              {likedSongs.length === 0 && (
                <div className="text-[0.75rem] opacity-70">
                  You have no liked songs yet.
                </div>
              )}
              {likedSongs.map((song) => (
                <label
                  key={song.id}
                  className="flex items-center gap-3 py-1.5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedToAdd.includes(song.id)}
                    onChange={() => toggleSelectAddSong(song.id)}
                    className="accent-white"
                  />
                  <div className="flex items-center gap-2">
                    <img
                      src={song.image}
                      alt={song.name}
                      className="h-9 w-9 rounded-md object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold truncate">
                        {song.name}
                      </span>
                      <span className="text-[0.7rem] opacity-70 truncate">
                        {(song.artists?.primary || [])
                          .map((a) => a.name)
                          .join(", ")}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSongs}
                className="text-xs px-3.5 py-1.5 rounded-full bg-white text-black font-semibold hover:opacity-90"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <Player />
      <Navigator />
    </>
  );
};

export default MyPlaylist;
