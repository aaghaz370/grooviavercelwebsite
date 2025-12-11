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
 * Final MyPlaylist.jsx
 * - Fixes: hero visibility, menu clipping, accidental play from menu taps.
 * - Keeps your original handlers and logic intact.
 */

const MyPlaylist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playMusic } = useContext(MusicContext);

  const [playlist, setPlaylist] = useState(null);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);

  // Song menu state
  const [openSongMenuId, setOpenSongMenuId] = useState(null);
  // Header (playlist) menu
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  // Position for the currently open song menu {top, left}
  const [songMenuPos, setSongMenuPos] = useState({ top: 0, left: 0 });

  // Add songs modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState([]);

  // Rename modal
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  // Multi-select
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedSongIds, setSelectedSongIds] = useState([]);

  // Visible count
  const [visibleCount, setVisibleCount] = useState(50);

  // -----------------------------
  // Load playlists + liked songs (unchanged logic)
  // -----------------------------
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

  // -----------------------------
  // Play / helpers (kept your API)
  // -----------------------------
  const playTrack = (song, queue) => {
    if (!song) return;
    const q = queue || playlist?.songs || [];
    playMusic(song.audio, song.name, song.duration, song.image, song.id, q);
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

  // -----------------------------
  // Multi-select (kept)
  // -----------------------------
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

  // -----------------------------
  // Add songs modal
  // -----------------------------
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

  // -----------------------------
  // Rename / delete (kept)
  // -----------------------------
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

  const handleDeletePlaylist = () => {
    if (!playlist) return;
    const updated = allPlaylists.filter((pl) => pl.id !== playlist.id);
    savePlaylists(updated);
    navigate("/my-music");
  };

  // -----------------------------
  // Labels
  // -----------------------------
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

  // not found
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

  // UI values
  const cover = playlist.songs?.[0]?.image || "/Unknown.png";
  const otherPlaylists = allPlaylists.filter((pl) => pl.id !== playlist.id);
  const visibleSongs = playlist.songs.slice(0, visibleCount);
  const hasMore = playlist.songs.length > visibleCount;

  // -----------------------------
  // Helpers for song menu positioning
  // -----------------------------
  const openSongMenu = (songId, event) => {
    // prevent row click
    event.stopPropagation();
    // close header menu
    setHeaderMenuOpen(false);
    // measure button and set fixed menu pos so it never gets clipped
    const btn = event.currentTarget;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      // show menu a bit below the button and align it to the right of screen
      const top = rect.top + window.scrollY + rect.height + 8;
      // prefer right aligned near viewport right
      const left = Math.max(12, rect.right - 220);
      setSongMenuPos({ top, left });
    }
    setOpenSongMenuId((prev) => (prev === songId ? null : songId));
  };

  // If any menu is open, clicking row should first close menus (and not play).
  // Row onClick checks this.
  const anyMenuOpen = Boolean(headerMenuOpen || openSongMenuId);

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <>
      <Navbar />

      {/* HERO — big blurred background + content on top */}
      <div className="relative w-full h-[22rem] lg:h-[28rem] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-105 opacity-60"
          style={{
            backgroundImage: `url(${cover})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(rgba(2,6,23,0.85), rgba(2,6,23,0.95))" }}
        />

        {/* content */}
        <div className="absolute left-0 right-0 bottom-0 px-6 lg:px-12 pb-6 z-30">
          <div className="flex items-end gap-6">
            <div className="translate-y-6">
              <div className="h-[9.5rem] w-[9.5rem] lg:h-[12rem] lg:w-[12rem] rounded-2xl overflow-hidden shadow-2xl border border-white/6 bg-white/5">
                <img src={cover} alt={playlist.name} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex-1 translate-y-6">
              <h1 className="text-2xl lg:text-4xl font-extrabold text-white leading-tight">{playlist.name}</h1>
              <div className="mt-2 text-sm lg:text-base text-white/80">
                {totalSongs} song{totalSongs !== 1 ? "s" : ""} • {totalDurationLabel}
              </div>

              <div className="mt-4 flex items-center gap-4">
                <button onClick={handleShufflePlay} className="h-11 w-11 rounded-full flex items-center justify-center bg-white/6 text-white/90" title="Shuffle">
                  <PiShuffleBold className="text-xl" />
                </button>

                <button onClick={handlePlayAll} className="h-16 w-16 rounded-full flex items-center justify-center bg-white text-black shadow-lg transform active:scale-95" title="Play">
                  <FaPlay className="text-2xl" />
                </button>

                {/* header menu button */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // close any open song menu when toggling header menu
                      setOpenSongMenuId(null);
                      setHeaderMenuOpen((v) => !v);
                    }}
                    className="h-11 w-11 rounded-full flex items-center justify-center bg-white/6 text-white/90"
                    aria-label="Playlist menu"
                  >
                    <BsThreeDotsVertical />
                  </button>

                  {/* fixed header menu (won't be clipped) */}
                  {headerMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setHeaderMenuOpen(false)} />
                      <div className="fixed right-6 top-20 w-56 bg-[#020617] rounded-2xl border border-white/10 shadow-2xl text-sm z-50 overflow-hidden">
                        <button className="w-full text-left px-4 py-3 hover:bg-white/6 flex items-center gap-3" onClick={() => { handlePlayAll(); setHeaderMenuOpen(false); }}>
                          <FaPlay className="text-[0.8rem]" /> Play all
                        </button>

                        <button className="w-full text-left px-4 py-3 hover:bg-white/6 flex items-center gap-3" onClick={() => { handleShufflePlay(); setHeaderMenuOpen(false); }}>
                          <PiShuffleBold className="text-[1rem]" /> Shuffle play
                        </button>

                        <div className="h-px bg-white/10 my-1" />

                        <button className="w-full text-left px-4 py-3 hover:bg-white/6" onClick={() => { setIsAddModalOpen(true); setHeaderMenuOpen(false); }}>
                          Add songs
                        </button>

                        <button className="w-full text-left px-4 py-3 hover:bg-white/6" onClick={() => { toggleMultiSelect(); setHeaderMenuOpen(false); }}>
                          {multiSelectMode ? "Cancel multi select" : "Select multiple songs"}
                        </button>

                        <button className="w-full text-left px-4 py-3 hover:bg-white/6" onClick={() => { openRename(); setHeaderMenuOpen(false); }}>
                          Rename playlist
                        </button>

                        <div className="h-px bg-white/10 my-1" />

                        <button className="w-full text-left px-4 py-3 hover:bg-white/6 text-red-300" onClick={() => { handleDeletePlaylist(); setHeaderMenuOpen(false); }}>
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
      </div>

      {/* CONTENT area pushed down so song list doesn't overlap hero */}
      <div className="min-h-[calc(100vh-6rem)] pb-40 px-6 lg:px-12 pt-[6.8rem]">
        {/* NOTE: pt equals about the visible hero area so list starts below hero */}
        <div className="mt-6">
          {playlist.songs.length === 0 && (
            <div className="text-sm text-white/70">Playlist is empty... Use “Add songs” to add from liked songs.</div>
          )}

          <div className="flex flex-col gap-3 mt-3">
            {visibleSongs.map((song, idx) => {
              const isSelected = selectedSongIds.includes(song.id);
              const trackNumber = idx + 1;
              const artists = (song.artists?.primary || []).map((a) => a.name).join(", ");

              return (
                <div key={song.id || `${song.name}-${idx}`} className="relative">
                  {/* row */}
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (multiSelectMode) toggleSelectSongForMulti(song.id);
                        else if (!anyMenuOpen) playTrack(song);
                      }
                    }}
                    onClick={() => {
                      // if menu open -> close it and DO NOT play (this prevents accidental play)
                      if (anyMenuOpen) {
                        setOpenSongMenuId(null);
                        setHeaderMenuOpen(false);
                        return;
                      }
                      if (multiSelectMode) {
                        toggleSelectSongForMulti(song.id);
                        return;
                      }
                      playTrack(song);
                    }}
                    className="flex items-center justify-between gap-3 w-full px-3 py-3 bg-white/2 rounded-xl hover:bg-white/5 active:bg-white/6 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-[0.8rem] w-6 text-right opacity-60">{trackNumber}</div>

                      {multiSelectMode && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelectSongForMulti(song.id);
                          }}
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

                    {/* right: duration + per-song menu */}
                    <div className="flex items-center gap-3">
                      <div className="text-xs opacity-70 w-12 text-right">
                        {song.duration ? new Date(song.duration * 1000).toISOString().substring(14, 19) : ""}
                      </div>

                      <div>
                        {/* stopPropagation so clicks only open menu */}
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => openSongMenu(song.id, e)}
                          className="p-1 rounded-full hover:bg-white/6"
                          aria-label="Song options"
                        >
                          <BsThreeDotsVertical />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show more */}
          {hasMore && (
            <div className="mt-4 flex justify-center">
              <button onClick={() => setVisibleCount((c) => c + 50)} className="px-4 py-2 rounded-full bg-white/6 border border-white/10 text-sm">
                Show more
              </button>
            </div>
          )}
        </div>

        {/* Related playlists */}
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

      {/* Fixed, positioned per-song menu (renders when openSongMenuId != null) */}
      {openSongMenuId && (
        <>
          {/* backdrop prevents accidental row clicks and closes menu */}
          <div className="fixed inset-0 z-40" onClick={() => setOpenSongMenuId(null)} />
          <div
            className="fixed z-50 bg-[#020617] rounded-2xl border border-white/10 shadow-2xl text-sm overflow-hidden"
            style={{
              top: songMenuPos.top,
              left: songMenuPos.left,
              width: 220,
            }}
          >
            {/* Play */}
            <button
              className="w-full text-left px-4 py-3 hover:bg-white/6"
              onClick={(e) => {
                e.stopPropagation();
                const s = playlist.songs.find((x) => x.id === openSongMenuId);
                if (s) playTrack(s);
                setOpenSongMenuId(null);
              }}
            >
              Play
            </button>

            <div className="h-px bg-white/10" />

            <button
              className="w-full text-left px-4 py-3 hover:bg-white/6 text-red-300"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveSong(openSongMenuId);
                setOpenSongMenuId(null);
              }}
            >
              Remove from playlist
            </button>
          </div>
        </>
      )}

      {/* ADD SONGS MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#09090B] w-[95%] max-w-[640px] max-h-[80vh] rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase opacity-70 tracking-wider">Add songs</div>
                <div className="text-lg font-semibold">Add from liked songs</div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="px-3 py-1 rounded-full bg-white/6">Close</button>
            </div>

            <div className="overflow-y-auto max-h-[55vh] pr-2">
              {likedSongs.length === 0 && <div className="text-sm opacity-70">You have no liked songs yet.</div>}

              {likedSongs.map((s) => (
                <label key={s.id} className="flex items-center gap-3 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedToAdd.includes(s.id)}
                    onChange={() => toggleSelectAddSong(s.id)}
                    className="accent-white"
                  />
                  <img src={s.image} alt={s.name} className="h-10 w-10 rounded-md object-cover" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{s.name}</div>
                    <div className="text-xs opacity-70 truncate">{(s.artists?.primary || []).map((a) => a.name).join(", ")}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-full bg-white/6">Cancel</button>
              <button onClick={handleAddSongs} className="px-4 py-2 rounded-full bg-white text-black font-semibold">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {isRenameOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#09090B] w-[92%] max-w-[420px] rounded-2xl p-4">
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
      )}

      {/* MULTI-SELECT ACTION BAR */}
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
