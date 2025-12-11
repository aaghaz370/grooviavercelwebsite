// src/pages/MyPlaylist.jsx
import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Player from "../components/Player";
import Navigator from "../components/Navigator";
import MusicContext from "../context/MusicContext";

import { BsThreeDotsVertical } from "react-icons/bs";
import { FaPlay } from "react-icons/fa";
import { PiShuffleBold } from "react-icons/pi";

/**
 * Final MyPlaylist page (playlist-style hero)
 * - Keeps your original logic and handlers exactly (playTrack, add, remove, rename, multi-select)
 * - Upgrades visual layout to match playlist page: big blurred background, album art, big play button, header menu
 * - Per-song menu and header menu remain functional and call your existing handlers
 *
 * NOTE: I intentionally did not change function names/behavior so your context and Player keep working exactly as before.
 */

const MyPlaylist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playMusic } = useContext(MusicContext);

  const [playlist, setPlaylist] = useState(null);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);

  const [openSongMenuId, setOpenSongMenuId] = useState(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  // add-songs modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState([]);

  // rename modal
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  // multi-select delete
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedSongIds, setSelectedSongIds] = useState([]);

  // YT Music style: show first 50, then "Show more"
  const [visibleCount, setVisibleCount] = useState(50);

  // -------------------------
  // Load playlists + liked songs (unchanged core logic)
  // -------------------------
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

    const found = migrated.find((pl) => String(pl.id) === String(id));
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

  // keep playTrack exactly as your version
  const playTrack = (song, queue) => {
    if (!song) return;
    const q = queue || playlist?.songs || [];
    playMusic(
      song.audio,
      song.name,
      song.duration,
      song.image,
      song.id,
      q
    );
  };

  // Shuffle helper unchanged
  const shuffleArray = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const handlePlayAll = () => {
    if (!playlist || playlist.songs.length === 0) return;
    playTrack(playlist.songs[0], playlist.songs);
  };

  const handleShufflePlay = () => {
    if (!playlist || playlist.songs.length === 0) return;
    const shuffled = shuffleArray(playlist.songs);
    playTrack(shuffled[0], shuffled);
  };

  const handleRemoveSong = (songId) => {
    if (!playlist) return;
    const newSongs = playlist.songs.filter((s) => s.id !== songId);
    updateCurrentPlaylist({ ...playlist, songs: newSongs });
    setOpenSongMenuId(null);
  };

  // multi-select handling (unchanged)
  const toggleMultiSelect = () => {
    setMultiSelectMode((m) => !m);
    setSelectedSongIds([]);
    setHeaderMenuOpen(false);
    setOpenSongMenuId(null);
  };

  const toggleSelectSongForMulti = (id) => {
    setSelectedSongIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const removeSelectedSongs = () => {
    if (!playlist || selectedSongIds.length === 0) return;
    const newSongs = playlist.songs.filter(
      (s) => !selectedSongIds.includes(s.id)
    );
    updateCurrentPlaylist({ ...playlist, songs: newSongs });
    setSelectedSongIds([]);
    setMultiSelectMode(false);
  };

  // add songs modal (unchanged)
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
        (s) => selectedToAdd.includes(s.id) && !existingIds.includes(s.id)
      )
      .map((s) => ({ ...s }));

    const newSongs = [...playlist.songs, ...toAdd];
    updateCurrentPlaylist({ ...playlist, songs: newSongs });

    setSelectedToAdd([]);
    setIsAddModalOpen(false);
  };

  // rename playlist (unchanged)
  const openRename = () => {
    if (!playlist) return;
    setRenameValue(playlist.name);
    setIsRenameOpen(true);
    setHeaderMenuOpen(false);
  };

  const handleRenameSave = () => {
    const name = renameValue.trim();
    if (!name || !playlist) {
      setIsRenameOpen(false);
      return;
    }
    const updated = { ...playlist, name };
    updateCurrentPlaylist(updated);
    setIsRenameOpen(false);
  };

  // delete playlist (unchanged)
  const handleDeletePlaylist = () => {
    if (!playlist) return;
    const updated = allPlaylists.filter((pl) => pl.id !== playlist.id);
    savePlaylists(updated);
    navigate("/my-music");
  };

  // total duration + pretty format (YT Music style) — unchanged
  const { totalDurationLabel } = useMemo(() => {
    if (!playlist) return { totalDurationLabel: "" };
    const totalSeconds = playlist.songs.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let label = "";
    if (hours > 0) label += `${hours} hr `;
    label += `${minutes} min`;
    return { totalDurationLabel: label };
  }, [playlist]);

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
  const otherPlaylists = allPlaylists.filter((pl) => pl.id !== playlist.id);

  // songs to render (first visibleCount, then show more)
  const visibleSongs = playlist.songs.slice(0, visibleCount);
  const hasMore = playlist.songs.length > visibleCount;

  // -------------------------
  // UI: playlist-style hero & page (visual only - functions unchanged)
  // -------------------------
  return (
    <>
      <Navbar />

      {/* HERO / big blurred background to mimic playlist page */}
      <div className="relative w-full h-[22rem] lg:h-[28rem] overflow-hidden">
        {/* blurred big background */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-105 opacity-60"
          style={{
            backgroundImage: `url(${cover})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            zIndex: 0,
          }}
        />
        {/* dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(rgba(2,6,23,0.8), rgba(2,6,23,0.9))",
            zIndex: 1,
          }}
        />

        <div className="absolute left-0 right-0 bottom-0 px-[1.6rem] lg:px-[3rem] pb-6 z-20">
          <div className="flex items-end gap-6">
            <div className="transform translate-y-6">
              <div className="h-[9.5rem] w-[9.5rem] lg:h-[12rem] lg:w-[12rem] rounded-2xl overflow-hidden shadow-2xl border border-white/6 bg-white/5">
                <img
                  src={cover}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 text-left translate-y-6">
              <h1 className="text-2xl lg:text-4xl font-extrabold text-white leading-tight">
                {playlist.name}
              </h1>
              <div className="mt-2 text-sm lg:text-base text-white/80">
                {playlist.songs.length} song
                {playlist.songs.length > 1 ? "s" : ""} • {totalDurationLabel}
              </div>

              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={handleShufflePlay}
                  className="h-11 w-11 rounded-full flex items-center justify-center transition-all bg-white/6 text-white/90"
                  title="Shuffle"
                >
                  <PiShuffleBold className="text-xl" />
                </button>

                <button
                  onClick={handlePlayAll}
                  className="h-16 w-16 rounded-full flex items-center justify-center bg-white text-black shadow-lg transform active:scale-95"
                  title="Play"
                >
                  <FaPlay className="text-2xl" />
                </button>

                {/* header menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setHeaderMenuOpen((v) => !v);
                      setOpenSongMenuId(null);
                    }}
                    className="h-11 w-11 rounded-full flex items-center justify-center bg-white/6 text-white/90"
                  >
                    <BsThreeDotsVertical />
                  </button>

                  {headerMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setHeaderMenuOpen(false)}
                      />
                      <div className="fixed right-4 top-20 w-48 bg-[#020617] rounded-2xl border border-white/10 shadow-2xl text-xs z-50 overflow-hidden">
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2"
                          onClick={() => {
                            handlePlayAll();
                            setHeaderMenuOpen(false);
                          }}
                        >
                          <FaPlay className="text-[0.7rem]" />
                          Play all
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2"
                          onClick={() => {
                            handleShufflePlay();
                            setHeaderMenuOpen(false);
                          }}
                        >
                          <PiShuffleBold className="text-sm" />
                          Shuffle play
                        </button>
                        <div className="h-px bg-white/10 my-1" />
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-white/10"
                          onClick={() => {
                            openRename();
                            setHeaderMenuOpen(false);
                          }}
                        >
                          Rename playlist
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-white/10"
                          onClick={() => {
                            toggleMultiSelect();
                            setHeaderMenuOpen(false);
                          }}
                        >
                          {multiSelectMode ? "Cancel multi select" : "Select multiple songs"}
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 hover:bg-white/10 text-red-300"
                          onClick={() => {
                            handleDeletePlaylist();
                            setHeaderMenuOpen(false);
                          }}
                        >
                          Delete playlist
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> {/* end hero */}

      {/* page content below hero */}
      <div className="min-h-[calc(100vh-6rem)] flex flex-col pb-40 px-[1.6rem] lg:px-[3rem] mt-[-3rem]">
        {/* SONG LIST – keep original functions/interaction exactly */}
        <div className="mt-6">
          {playlist.songs.length === 0 && (
            <div className="text-xs opacity-70">
              No songs yet. Use “Add songs” to add from liked songs.
            </div>
          )}

          {visibleSongs.map((song, idx) => {
            const isSelected = selectedSongIds.includes(song.id);
            const trackNumber = idx + 1;
            return (
              <div
                key={song.id}
                className="flex items-center justify-between px-2 py-1.5 rounded-xl transition-colors"
              >
                <div
                  className="flex items-center gap-3 flex-1 min-w-0"
                  onClick={() =>
                    multiSelectMode
                      ? toggleSelectSongForMulti(song.id)
                      : playTrack(song)
                  }
                >
                  {/* Index number */}
                  <span className="w-6 text-[0.7rem] text-right opacity-60">
                    {trackNumber}
                  </span>

                  {multiSelectMode && (
                    <input
                      type="checkbox"
                      className="accent-white"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectSongForMulti(song.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}

                  <img
                    src={song.image}
                    alt={song.name}
                    className="h-9 w-9 rounded-md object-cover"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">
                      {song.name}
                    </span>
                    <span className="text-[0.7rem] opacity-70 truncate">
                      {(song.artists?.primary || [])
                        .map((a) => a.name)
                        .join(", ")}
                    </span>
                  </div>
                </div>

                {/* right side: duration + menu */}
                {!multiSelectMode && (
                  <div className="flex items-center gap-2 ml-2 relative">
                    <span className="text-[0.7rem] opacity-70">
                      {song.duration
                        ? new Date(song.duration * 1000)
                            .toISOString()
                            .substring(14, 19)
                        : ""}
                    </span>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenSongMenuId(
                            openSongMenuId === song.id ? null : song.id
                          )
                        }
                        className="p-1 rounded-full hover:bg-white/10"
                      >
                        <BsThreeDotsVertical />
                      </button>

                      {openSongMenuId === song.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenSongMenuId(null)}
                          />
                          <div className="absolute right-0 top-8 w-40 bg-[#020617] rounded-2xl border border-white/10 shadow-2xl text-xs z-20 overflow-hidden">
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-white/10"
                              onClick={() => {
                                playTrack(song);
                                setOpenSongMenuId(null);
                              }}
                            >
                              Play
                            </button>

                            <button
                              className="w-full text-left px-3 py-2 hover:bg-white/10"
                              onClick={() => {
                                setIsAddModalOpen(true);
                                setOpenSongMenuId(null);
                              }}
                            >
                              Add songs
                            </button>

                            <button
                              className="w-full text-left px-3 py-2 hover:bg-white/10"
                              onClick={() => {
                                toggleMultiSelect();
                                setOpenSongMenuId(null);
                              }}
                            >
                              {multiSelectMode ? "Cancel multi select" : "Select multiple songs"}
                            </button>

                            <button
                              className="w-full text-left px-3 py-2 hover:bg-white/10"
                              onClick={() => {
                                openRename();
                                setOpenSongMenuId(null);
                              }}
                            >
                              Rename playlist
                            </button>

                            <div className="h-px bg-white/10 my-1" />

                            <button
                              className="w-full text-left px-3 py-2 hover:bg-white/10 text-red-300"
                              onClick={() => handleRemoveSong(song.id)}
                            >
                              Remove from playlist
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {multiSelectMode && (
                  <span className="text-[0.7rem] opacity-70 ml-2">
                    {song.duration
                      ? new Date(song.duration * 1000)
                          .toISOString()
                          .substring(14, 19)
                      : ""}
                  </span>
                )}
              </div>
            );
          })}

          {/* Show more button (YT Music style) */}
          {hasMore && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => setVisibleCount((c) => c + 50)}
                className="px-4 py-2 text-xs rounded-full bg-white/5 border border-white/15 hover:bg-white/10"
              >
                Show more
              </button>
            </div>
          )}
        </div>

        {/* MULTI-SELECT bottom bar */}
        {multiSelectMode && (
          <div className="fixed bottom-[4.5rem] left-0 right-0 z-30 flex justify-center">
            <div className="bg-[#111827] px-4 py-2 rounded-full border border-white/10 flex items-center gap-3 text-xs">
              <span>{selectedSongIds.length} selected</span>
              <button
                onClick={removeSelectedSongs}
                disabled={selectedSongIds.length === 0}
                className={`px-3 py-1 rounded-full ${
                  selectedSongIds.length === 0
                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                    : "bg-white text-black hover:opacity-90"
                }`}
              >
                Remove
              </button>
              <button
                onClick={toggleMultiSelect}
                className="px-2 py-1 rounded-full bg-white/10 hover:bg-white/15"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Related / other playlists (YT Music style "Related") */}
        {otherPlaylists.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold mb-2">Related playlists</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scroll-hide">
              {otherPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  className="min-w-[150px] max-w-[180px] flex flex-col gap-1 cursor-pointer"
                  onClick={() => navigate(`/my-playlists/${pl.id}`)}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-white/5">
                    <img
                      src={pl.songs?.[0]?.image || "/Unknown.png"}
                      alt={pl.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium truncate">
                    {pl.name}
                  </span>
                  <span className="text-xs opacity-70 truncate">
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
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
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

      {/* RENAME MODAL */}
      {isRenameOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#09090B] w-[90%] max-w-[420px] rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold">Rename playlist</h2>
              <button
                onClick={() => setIsRenameOpen(false)}
                className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 hover:bg-white/15"
              >
                Close
              </button>
            </div>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg bg-white/5 border border-white/15 outline-none"
              placeholder="Playlist name"
            />
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => setIsRenameOpen(false)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameSave}
                className="text-xs px-3.5 py-1.5 rounded-full bg-white text-black font-semibold hover:opacity-90"
              >
                Save
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
