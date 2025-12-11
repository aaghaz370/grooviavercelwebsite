// src/pages/MyPlaylist.jsx
import { useEffect, useState, useContext, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Player from "../components/Player";
import Navigator from "../components/Navigator";
import MusicContext from "../context/MusicContext";

import { BsThreeDotsVertical } from "react-icons/bs";
import { FaPlay, FaPause, FaPlus } from "react-icons/fa";
import { PiShuffleBold } from "react-icons/pi";

/**
 * Final cleaned MyPlaylist.jsx
 * - Keeps existing playlist logic (play/add/remove/rename/multi-select)
 * - Fixes z-index / header overlap / modal visibility issues
 * - Square cover, clean header layout, add-song dynamic card with search
 *
 * Notes:
 * - Assumes Navbar is fixed at top. This file adds top spacing so hero doesn't hide behind Navbar.
 * - Add modal uses `topOffset` to remain below Navbar so Navbar remains visible.
 */

const NAVBAR_HEIGHT_PX = 64; // adjust if your Navbar height differs (in px)

const MyPlaylist = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    playMusic,
    currentSong,
    isPlaying,
    shuffle: isShuffleEnabled,
    toggleShuffle,
  } = useContext(MusicContext) || {};

  const [playlist, setPlaylist] = useState(null);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);

  const [openSongMenuId, setOpenSongMenuId] = useState(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [addSearch, setAddSearch] = useState("");

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedSongIds, setSelectedSongIds] = useState([]);

  const [visibleCount, setVisibleCount] = useState(50);

  const ignoreNextRowClick = useRef(false);

  // -------------------------
  // Load playlists + liked songs (unchanged)
  // -------------------------
  useEffect(() => {
    const storedLiked = JSON.parse(localStorage.getItem("likedSongs")) || [];
    const storedCustom =
      JSON.parse(localStorage.getItem("customPlaylists")) || [];

    setLikedSongs(storedLiked);

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

  // keep playTrack same
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

  // multi-select unchanged
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

  // Add modal selection + search
  const toggleSelectAddSong = (id) => {
    setSelectedToAdd((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddSongs = () => {
    if (!playlist) return;
    if (selectedToAdd.length === 0) {
      setIsAddModalOpen(false);
      setAddSearch("");
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
    setAddSearch("");
  };

  // rename playlist
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

  // delete playlist
  const handleDeletePlaylist = () => {
    if (!playlist) return;
    const updated = allPlaylists.filter((pl) => pl.id !== playlist.id);
    savePlaylists(updated);
    navigate("/my-music");
  };

  // duration label
  const { totalDurationLabel, totalSongs } = useMemo(() => {
    if (!playlist) return { totalDurationLabel: "", totalSongs: 0 };
    const totalSeconds = playlist.songs.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let label = "";
    if (hours > 0) label += `${hours} hr `;
    label += `${minutes} min`;
    return { totalDurationLabel: label, totalSongs: playlist.songs.length };
  }, [playlist]);

  if (!playlist) {
    return (
      <>
        <Navbar />
        <div className="mt-[8rem] px-6 text-sm">
          Playlist not found.
          <button onClick={() => navigate("/my-music")} className="ml-2 underline">
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
  const visibleSongs = playlist.songs.slice(0, visibleCount);
  const hasMore = playlist.songs.length > visibleCount;

  const isPlaylistPlaying = Boolean(
    currentSong && playlist.songs.some((s) => s.id === currentSong.id)
  );

  const handleHeaderPlayPause = (e) => {
    if (e) e.stopPropagation();
    if (isPlaylistPlaying && isPlaying) {
      const cs = currentSong;
      if (cs) {
        playMusic(cs.audio || cs, cs.name, cs.duration, cs.image, cs.id, playlist.songs);
        return;
      }
    }
    handlePlayAll();
  };

  const closeAllMenus = () => {
    setOpenSongMenuId(null);
    setHeaderMenuOpen(false);
    ignoreNextRowClick.current = true;
    setTimeout(() => (ignoreNextRowClick.current = false), 150);
  };

  // add modal filter
  const filteredLiked = likedSongs.filter((s) =>
    (s.name || "").toLowerCase().includes(addSearch.trim().toLowerCase()) ||
    ((s.artists?.primary || []).map(a => a.name).join(", ") || "").toLowerCase().includes(addSearch.trim().toLowerCase())
  );

  // top offset so hero & modal start below fixed Navbar
  const topOffsetStyle = { top: `${NAVBAR_HEIGHT_PX}px` };

  return (
    <>
      <Navbar />

      {/* main page container: add padding top so content not hidden under Navbar */}
      <div style={{ paddingTop: `${NAVBAR_HEIGHT_PX + 12}px` }}>
        {/* HERO / banner */}
        <div className="relative w-full overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-105 opacity-60"
            style={{ backgroundImage: `url(${cover})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(2,6,23,0.86) 0%, rgba(2,6,23,0.95) 100%)",
            }}
          />

          <div className="relative z-30 max-w-[1200px] mx-auto px-6 lg:px-12 py-8">
            <div className="flex items-center gap-6">
              {/* square cover */}
              <div className="w-[9.5rem] h-[9.5rem] lg:w-[12rem] lg:h-[12rem] rounded-xl overflow-hidden shadow-2xl border border-white/6 bg-white/5 flex-shrink-0">
                <img src={cover} alt={playlist.name} className="w-full h-full object-cover" draggable={false} />
              </div>

              <div className="flex-1">
                <div className="mb-2">
                  {/* removed "Custom playlist" label per request */}
                  <h1 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight mt-0">
                    {playlist.name}
                  </h1>
                  <div className="mt-2 text-sm text-white/80">
                    {totalSongs} song{totalSongs !== 1 ? "s" : ""} • {totalDurationLabel}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={() => {
                      closeAllMenus();
                      setIsAddModalOpen(true);
                    }}
                    className="h-10 w-10 rounded-full flex items-center justify-center bg-transparent border border-white/12 text-white/90"
                    aria-label="Add songs"
                  >
                    <div className="h-7 w-7 rounded-full flex items-center justify-center bg-[#0f1724]/20">
                      <FaPlus className="text-sm" />
                    </div>
                  </button>

                  <button
                    onClick={(e) => {
                      closeAllMenus();
                      handleHeaderPlayPause(e);
                    }}
                    className="h-16 w-16 rounded-full flex items-center justify-center bg-white text-black shadow-lg transform active:scale-95"
                    title={isPlaylistPlaying && isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaylistPlaying && isPlaying ? <FaPause className="text-2xl" /> : <FaPlay className="text-2xl" />}
                  </button>

                  <button
                    onClick={() => {
                      closeAllMenus();
                      if (typeof toggleShuffle === "function") toggleShuffle();
                      else handleShufflePlay();
                    }}
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${isShuffleEnabled ? "bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white" : "bg-transparent border border-white/12 text-white/90"}`}
                    aria-label="Shuffle"
                  >
                    <PiShuffleBold className="text-lg" />
                  </button>

                  <div className="ml-2 relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeaderMenuOpen((v) => !v);
                        setOpenSongMenuId(null);
                      }}
                      className="h-10 w-10 rounded-full flex items-center justify-center bg-transparent border border-white/12 text-white/90"
                      aria-label="Playlist menu"
                    >
                      <BsThreeDotsVertical />
                    </button>

                    {headerMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setHeaderMenuOpen(false)} />
                        <div className="fixed right-6" style={{ top: `${NAVBAR_HEIGHT_PX + 28}px` }}>
                          <div className="w-56 bg-[#020617] rounded-2xl border border-white/10 shadow-2xl text-sm z-50 overflow-hidden">
                            <button className="w-full text-left px-4 py-3 hover:bg-white/6" onClick={() => { handlePlayAll(); setHeaderMenuOpen(false); }}>Play all</button>
                            <button className="w-full text-left px-4 py-3 hover:bg-white/6" onClick={() => { handleShufflePlay(); setHeaderMenuOpen(false); }}>Shuffle play</button>
                            <div className="h-px bg-white/10 my-1" />
                            <button className="w-full text-left px-4 py-3 hover:bg-white/6" onClick={() => { setIsAddModalOpen(true); setHeaderMenuOpen(false); }}>Add songs</button>
                            <button className="w-full text-left px-4 py-3 hover:bg-white/6" onClick={() => { toggleMultiSelect(); setHeaderMenuOpen(false); }}>{multiSelectMode ? "Cancel multi select" : "Select multiple songs"}</button>
                            <button className="w-full text-left px-4 py-3 hover:bg-white/6" onClick={() => { openRename(); setHeaderMenuOpen(false); }}>Rename playlist</button>
                            <div className="h-px bg-white/10 my-1" />
                            <button className="w-full text-left px-4 py-3 hover:bg-white/6 text-red-300" onClick={() => { handleDeletePlaylist(); setHeaderMenuOpen(false); }}>Delete playlist</button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SONG LIST */}
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12 pb-40 mt-4">
          <div className="mt-2">
            {playlist.songs.length === 0 ? (
              <div className="text-sm text-white/70">No songs yet. Use “Add songs” to add from liked songs.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {visibleSongs.map((song, idx) => {
                  const isSelected = selectedSongIds.includes(song.id);
                  const trackNumber = idx + 1;
                  const artists = (song.artists?.primary || []).map((a) => a.name).join(", ");
                  const isThisPlaying = currentSong && currentSong.id === song.id && isPlaying;

                  return (
                    <div key={song.id || `${song.name}-${idx}`} className="relative">
                      <div
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") { if (multiSelectMode) toggleSelectSongForMulti(song.id); else playTrack(song); } }}
                        onClick={() => {
                          if (ignoreNextRowClick.current) return;
                          if (headerMenuOpen || openSongMenuId) {
                            setHeaderMenuOpen(false);
                            setOpenSongMenuId(null);
                            return;
                          }
                          if (multiSelectMode) {
                            toggleSelectSongForMulti(song.id);
                            return;
                          }
                          playTrack(song);
                        }}
                        className={`flex items-center justify-between gap-3 w-full px-3 py-3 rounded-xl transition-colors cursor-pointer ${isThisPlaying ? "bg-white/8 shadow-inner" : "hover:bg-white/3"}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="text-[0.8rem] w-6 text-right opacity-60">{trackNumber}</div>

                          {multiSelectMode && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => { e.stopPropagation(); toggleSelectSongForMulti(song.id); }}
                              onClick={(e) => e.stopPropagation()}
                              className="accent-white"
                            />
                          )}

                          <img src={song.image} alt={song.name} className="h-12 w-12 rounded-md object-cover" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate text-white">{song.name}</div>
                            <div className="text-xs opacity-70 truncate">{artists}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-xs opacity-70 w-12 text-right">
                            {song.duration ? new Date(song.duration * 1000).toISOString().substring(14, 19) : ""}
                          </div>

                          <div className="relative">
                            <button
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => { e.stopPropagation(); setOpenSongMenuId(openSongMenuId === song.id ? null : song.id); setHeaderMenuOpen(false); }}
                              className="p-1 rounded-full hover:bg-white/6"
                              aria-label="Song options"
                            >
                              <BsThreeDotsVertical />
                            </button>

                            {openSongMenuId === song.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpenSongMenuId(null)} />
                                <div className="absolute right-0 top-10 w-44 bg-[#020617] rounded-2xl border border-white/10 shadow-2xl text-sm z-50 overflow-hidden">
                                  <button className="w-full text-left px-4 py-3 hover:bg-white/6" onClick={(e) => { e.stopPropagation(); playTrack(song); setOpenSongMenuId(null); }}>Play</button>
                                  <div className="h-px bg-white/10" />
                                  <button className="w-full text-left px-4 py-3 hover:bg-white/6 text-red-300" onClick={(e) => { e.stopPropagation(); handleRemoveSong(song.id); setOpenSongMenuId(null); }}>Remove from playlist</button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {hasMore && (
              <div className="mt-4 flex justify-center">
                <button onClick={() => setVisibleCount((c) => c + 50)} className="px-4 py-2 rounded-full bg-white/6 border border-white/10 text-sm">Show more</button>
              </div>
            )}
          </div>

          {/* related playlists unchanged */}
          {otherPlaylists.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-white mb-4">Related playlists</h2>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {otherPlaylists.map((pl) => (
                  <div key={pl.id} className="min-w-[150px] max-w-[180px] flex flex-col gap-2 cursor-pointer" onClick={() => navigate(`/my-playlists/${pl.id}`)}>
                    <div className="aspect-square rounded-xl overflow-hidden bg-white/5">
                      <img src={pl.songs?.[0]?.image || "/Unknown.png"} alt={pl.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="text-sm font-medium truncate text-white">{pl.name}</div>
                    <div className="text-xs opacity-70">{pl.songs.length} song{pl.songs.length > 1 ? "s" : ""}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD SONGS DYNAMIC CARD (full-screen card but below Navbar) */}
      {isAddModalOpen && (
        <>
          {/* solid dark backdrop */}
          <div className="fixed inset-0 z-60 bg-black/95" />

          {/* dynamic card anchored below navbar */}
          <div
            className="fixed left-0 right-0 bottom-0 z-70 flex items-start justify-center"
            style={{ ...topOffsetStyle, height: `calc(100% - ${NAVBAR_HEIGHT_PX}px)` }}
          >
            <div className="w-full max-w-[720px] bg-[#0b0b0c] rounded-2xl shadow-2xl overflow-hidden m-4">
              <div className="flex items-center justify-between p-4 border-b border-white/6">
                <div>
                  <div className="text-lg font-semibold">Add songs</div>
                  <div className="text-xs opacity-70">Select songs from your liked list</div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => { setIsAddModalOpen(false); setAddSearch(""); setSelectedToAdd([]); }} className="text-sm px-3 py-1 rounded-full bg-white/6">Close</button>
                </div>
              </div>

              <div className="p-4 border-b border-white/6">
                <input
                  value={addSearch}
                  onChange={(e) => setAddSearch(e.target.value)}
                  placeholder="Search liked songs"
                  className="w-full px-3 py-2 rounded-lg bg-[#0f1724] border border-white/10 text-white outline-none"
                />
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
                {filteredLiked.length === 0 ? (
                  <div className="text-sm opacity-70 p-4">No liked songs match your search.</div>
                ) : (
                  filteredLiked.map((s) => (
                    <label key={s.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedToAdd.includes(s.id)}
                        onChange={() => toggleSelectAddSong(s.id)}
                        className="w-4 h-4 accent-[#9b5cf6] cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <img src={s.image} alt={s.name} className="h-12 w-12 rounded-md object-cover" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{s.name}</div>
                        <div className="text-xs opacity-70 truncate">{(s.artists?.primary || []).map(a => a.name).join(", ")}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-4 border-t border-white/6">
                <button onClick={() => { setIsAddModalOpen(false); setAddSearch(""); setSelectedToAdd([]); }} className="px-4 py-2 rounded-full bg-white/6">Cancel</button>
                <button onClick={handleAddSongs} className="px-4 py-2 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white font-semibold">Add ({selectedToAdd.length})</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* RENAME modal (unchanged) */}
      {isRenameOpen && (
        <>
          <div className="fixed inset-0 z-60 bg-black/70" onClick={() => setIsRenameOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-70 p-4">
            <div className="bg-[#09090B] w-full max-w-[420px] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold">Rename playlist</div>
                <button onClick={() => setIsRenameOpen(false)} className="px-3 py-1 rounded-full bg-white/6">Close</button>
              </div>
              <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 outline-none" placeholder="Playlist name" />
              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => setIsRenameOpen(false)} className="px-3 py-2 rounded-full bg-white/6">Cancel</button>
                <button onClick={handleRenameSave} className="px-3 py-2 rounded-full bg-white text-black font-semibold">Save</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* multi-select action bar unchanged */}
      {multiSelectMode && (
        <div className="fixed bottom-[4.5rem] left-0 right-0 z-60 flex justify-center">
          <div className="bg-[#111827] px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
            <div className="text-sm">{selectedSongIds.length} selected</div>
            <button onClick={removeSelectedSongs} disabled={selectedSongIds.length === 0} className={`px-3 py-1 rounded-full ${selectedSongIds.length === 0 ? "bg-white/10 text-white/40 cursor-not-allowed" : "bg-white text-black"}`}>Remove</button>
            <button onClick={toggleMultiSelect} className="px-3 py-1 rounded-full bg-white/6">Cancel</button>
          </div>
        </div>
      )}

      <Player />
      <Navigator />
    </>
  );
};

export default MyPlaylist;
