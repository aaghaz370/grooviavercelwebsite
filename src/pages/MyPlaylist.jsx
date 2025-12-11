// src/pages/MyPlaylist.jsx
import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Player from "../components/Player";
import Navigator from "../components/Navigator";
import MusicContext from "../context/MusicContext";

import { BsThreeDotsVertical } from "react-icons/bs";
import { FaPlay, FaPause } from "react-icons/fa";
import { PiShuffleBold } from "react-icons/pi";

const MyPlaylist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    playMusic,
    currentSong,
    isPlaying,
    shuffle,
    toggleShuffle,
  } = useContext(MusicContext) || {};

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

  // load playlists + liked songs
  useEffect(() => {
    const storedLiked = JSON.parse(localStorage.getItem("likedSongs")) || [];
    const storedCustom = JSON.parse(localStorage.getItem("customPlaylists")) || [];

    setLikedSongs(storedLiked);

    // migrate data (if old format)
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

  const playTrack = (song, queue) => {
    if (!song) return;
    const q = queue || playlist?.songs || [];
    const audioSource = song?.downloadUrl
      ? song.downloadUrl[4]?.url || song.downloadUrl[0]?.url || song.audio
      : song.audio;
    playMusic(
      audioSource,
      song.name,
      song.duration,
      song.image,
      song.id,
      song.artists,
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
    if (!playlist || !playlist.songs || playlist.songs.length === 0) return;
    playTrack(playlist.songs[0], playlist.songs);
  };

  const handleShufflePlay = () => {
    if (!playlist || !playlist.songs || playlist.songs.length === 0) return;
    const shuffled = shuffleArray(playlist.songs);
    playTrack(shuffled[0], shuffled);
  };

  const handleRemoveSong = (songId) => {
    if (!playlist) return;
    const newSongs = playlist.songs.filter((s) => s.id !== songId);
    updateCurrentPlaylist({ ...playlist, songs: newSongs });
    setOpenSongMenuId(null);
  };

  // multi-select handling
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

  // add songs modal
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

  // total duration + pretty format (YT Music style)
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

  const playlistImage = playlist.songs?.[0]?.image || "/Unknown.png";
  const otherPlaylists = allPlaylists.filter((pl) => pl.id !== playlist.id);

  // songs to render (first visibleCount, then show more)
  const visibleSongs = playlist.songs.slice(0, visibleCount);
  const hasMore = playlist.songs.length > visibleCount;

  // detect if this playlist is playing (if currentSong is part of this playlist)
  const isPlaylistPlaying = Boolean(
    currentSong && playlist.songs.some((s) => s.id === currentSong.id)
  );

  const getSongImage = (song) =>
    song?.image || playlistImage;

  return (
    <>
      <Navbar />

      {/* HERO / banner — like PlaylistDetails with big blurred background */}
      <div className="relative w-full h-[22rem] lg:h-[28rem] overflow-hidden">
        {/* Large blurred background image layer (robust) */}
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-105 opacity-60"
          style={{ backgroundImage: `url(${playlistImage})`, zIndex: 0 }}
        />
        {/* gradient overlay (darker) */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(rgba(2,6,23,0.8), rgba(2,6,23,0.9))", zIndex: 1 }}
        />

        <div className="absolute left-0 right-0 bottom-0 px-[1.6rem] lg:px-[3rem] pb-6 z-20">
          <div className="flex items-end gap-6">
            <div className="transform translate-y-6">
              <div className="h-[9.5rem] w-[9.5rem] lg:h-[12rem] lg:w-[12rem] rounded-2xl overflow-hidden shadow-2xl border border-white/6">
                <img src={playlistImage} alt={playlist.name || "Playlist"} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex-1 text-left translate-y-6">
              <h1 className="text-2xl lg:text-4xl font-extrabold text-white leading-tight">
                {playlist.name}
              </h1>
              <div className="mt-2 text-sm lg:text-base text-white/80">
                {totalSongs} song{totalSongs !== 1 ? "s" : ""} • {totalDurationLabel}
              </div>

              <div className="mt-4 flex items-center gap-4">
                {/* small shuffle icon */}
                <button
                  onClick={() => toggleShuffle && toggleShuffle()}
                  className={`h-11 w-11 rounded-full flex items-center justify-center transition-all ${
                    shuffle ? "bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white" : "bg-white/6 text-white/80"
                  }`}
                  title="Shuffle"
                >
                  <PiShuffleBold className="text-xl" />
                </button>

                {/* main big play/pause */}
                <button
                  onClick={() => {
                    if (isPlaylistPlaying && isPlaying) {
                      // pause — call playMusic again with currentSong to toggle
                      playMusic(
                        currentSong?.audio?.currentSrc || currentSong?.audio,
                        currentSong?.name,
                        currentSong?.duration,
                        currentSong?.image,
                        currentSong?.id,
                        playlist.songs
                      );
                    } else {
                      // start playlist
                      handlePlayAll();
                    }
                  }}
                  className="h-16 w-16 rounded-full flex items-center justify-center bg-white text-black shadow-lg transform active:scale-95"
                  title={isPlaylistPlaying && isPlaying ? "Pause" : "Play"}
                >
                  {isPlaylistPlaying && isPlaying ? <FaPause className="text-2xl" /> : <FaPlay className="text-2xl" />}
                </button>

                {/* header menu: fixed so it won't be clipped */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setHeaderMenuOpen((v) => !v);
                      setOpenSongMenuId(null);
                    }}
                    className="h-11 w-11 rounded-full flex items-center justify-center bg-white/6 text-white/80"
                    title="Playlist menu"
                  >
                    <BsThreeDotsVertical />
                  </button>

                  {headerMenuOpen && (
                    <>
                      {/* fixed backdrop and fixed menu to avoid clipping by overflow parents */}
                      <div className="fixed inset-0 z-50" onClick={() => setHeaderMenuOpen(false)} />
                      <div className="fixed right-4 top-20 w-48 bg-[#020617] rounded-2xl border border-white/10 shadow-2xl text-xs z-60 overflow-hidden">
                        <button className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2" onClick={handlePlayAll}>
                          <FaPlay className="text-[0.7rem]" /> Play all
                        </button>
                        <button className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2" onClick={handleShufflePlay}>
                          <PiShuffleBold className="text-sm" /> Shuffle play
                        </button>
                        <div className="h-px bg-white/10 my-1" />
                        <button className="w-full text-left px-3 py-2 hover:bg-white/10" onClick={() => { setIsAddModalOpen(true); setHeaderMenuOpen(false); }}>
                          Add songs
                        </button>
                        <button className="w-full text-left px-3 py-2 hover:bg-white/10" onClick={openRename}>
                          Rename playlist
                        </button>
                        <button className="w-full text-left px-3 py-2 hover:bg-white/10" onClick={toggleMultiSelect}>
                          {multiSelectMode ? "Cancel multi select" : "Select multiple songs"}
                        </button>
                        <button className="w-full text-left px-3 py-2 hover:bg-white/10 text-red-300" onClick={handleDeletePlaylist}>
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

      {/* page content below hero */}
      <div className="flex flex-col mt-2 px-[1.6rem] lg:px-[3rem] pb-32 -mt-12">
        {/* songs list YT-like */}
        <div className="mt-4">
          {playlist.songs.length === 0 && <div className="text-sm opacity-70">Playlist is empty...</div>}

          {visibleSongs.map((song, idx) => {
            const artists = (song.artists?.primary || []).map((a) => a?.name).join(", ") || "";
            const songImg = getSongImage(song);
            const displayName = song.name || song.title || "";
            return (
              // use a div (not a button) for the row so nested controls don't conflict
              <div key={song.id || `${song.name}-${idx}`} className="relative">
                <div
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => { if (e.key === "Enter") playTrack(song); }}
                  onClick={() => {
                    if (multiSelectMode) {
                      toggleSelectSongForMulti(song.id);
                      return;
                    }
                    playTrack(song);
                  }}
                  className="flex items-center justify-between w-full px-2 py-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img src={songImg} alt={displayName} className="h-12 w-12 rounded-md object-cover" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{displayName}</span>
                      <span className="text-[0.8rem] opacity-70 truncate">{artists}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="ml-3 text-[0.8rem] opacity-70">
                      {song.duration ? new Date(song.duration * 1000).toISOString().substring(14, 19) : ""}
                    </span>

                    {/* Wrap this button and its menu in a relative container so the absolute menu is positioned to it */}
                    <div className="relative">
                      {/* Stop pointer events from bubbling to the row */}
                      <button
                        onPointerDown={(e) => { e.stopPropagation(); }}
                        onClick={(e) => { e.stopPropagation(); setOpenSongMenuId(openSongMenuId === song.id ? null : song.id); }}
                        className="p-1 rounded-full hover:bg-white/10"
                        aria-label="Song options"
                      >
                        <BsThreeDotsVertical />
                      </button>

                      {openSongMenuId === song.id && (
                        <>
                          {/* clicking outside closes menu, backdrop is fixed to avoid clipping */}
                          <div className="fixed inset-0 z-50" onClick={() => setOpenSongMenuId(null)} />
                          <div className="absolute right-0 top-10 w-40 bg-[#020617] rounded-2xl border border-white/10 shadow-2xl text-xs z-60 overflow-hidden">
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-white/10"
                              onClick={(e) => { e.stopPropagation(); playTrack(song); setOpenSongMenuId(null); }}
                            >
                              Play
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-white/10 text-red-300"
                              onClick={(e) => { e.stopPropagation(); handleRemoveSong(song.id); }}
                            >
                              Remove from playlist
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {hasMore && (
            <div className="mt-4 flex justify-center">
              <button onClick={() => setVisibleCount((c) => c + 50)} className="px-4 py-2 rounded-full bg-white/6 border border-white/10">
                Show more
              </button>
            </div>
          )}
        </div>

        {/* Related playlists */}
        {allPlaylists.length > 1 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold mb-2">Related playlists</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scroll-hide">
              {otherPlaylists.map((pl) => (
                <div key={pl.id} className="min-w-[150px] max-w-[180px] flex flex-col gap-1 cursor-pointer" onClick={() => navigate(`/my-playlists/${pl.id}`)}>
                  <div className="aspect-square rounded-xl overflow-hidden bg-white/5">
                    <img src={pl.songs?.[0]?.image || "/Unknown.png"} alt={pl.name} className="h-full w-full object-cover" />
                  </div>
                  <span className="text-sm font-medium truncate">{pl.name}</span>
                  <span className="text-xs opacity-70 truncate">{pl.songs.length} song{pl.songs.length > 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ADD SONGS MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#09090B] w-[95%] max-w-[550px] max-h-[80vh] rounded-2xl p-4 flex flex-col gap-3 z-80">
            <div className="flex items-center justify-between mb-1">
              <div className="flex flex-col">
                <span className="text-xs opacity-70 uppercase tracking-[0.16em]">Add songs</span>
                <h2 className="text-lg font-semibold">Add from liked songs</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 hover:bg-white/15">Close</button>
            </div>

            <div className="overflow-y-auto max-h-[55vh] pr-1">
              {likedSongs.length === 0 && <div className="text-[0.75rem] opacity-70">You have no liked songs yet.</div>}
              {likedSongs.map((song) => (
                <label key={song.id} className="flex items-center gap-3 py-1.5 cursor-pointer">
                  <input type="checkbox" checked={selectedToAdd.includes(song.id)} onChange={() => toggleSelectAddSong(song.id)} className="accent-white" />
                  <div className="flex items-center gap-2">
                    <img src={song.image} alt={song.name} className="h-9 w-9 rounded-md object-cover" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold truncate">{song.name}</span>
                      <span className="text-[0.7rem] opacity-70 truncate">{(song.artists?.primary || []).map((a) => a.name).join(", ")}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setIsAddModalOpen(false)} className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15">Cancel</button>
              <button onClick={handleAddSongs} className="text-xs px-3.5 py-1.5 rounded-full bg-white text-black font-semibold hover:opacity-90">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {isRenameOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#09090B] w-[90%] max-w-[420px] rounded-2xl p-4 flex flex-col gap-3 z-80">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold">Rename playlist</h2>
              <button onClick={() => setIsRenameOpen(false)} className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 hover:bg-white/15">Close</button>
            </div>
            <input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} className="w-full text-sm px-3 py-2 rounded-lg bg-white/5 border border-white/15 outline-none" placeholder="Playlist name" />
            <div className="flex justify-end gap-2 mt-1">
              <button onClick={() => setIsRenameOpen(false)} className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15">Cancel</button>
              <button onClick={handleRenameSave} className="text-xs px-3.5 py-1.5 rounded-full bg-white text-black font-semibold hover:opacity-90">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-SELECT bottom bar */}
      {multiSelectMode && (
        <div className="fixed bottom-[4.5rem] left-0 right-0 z-70 flex justify-center">
          <div className="bg-[#111827] px-4 py-2 rounded-full border border-white/10 flex items-center gap-3 text-xs">
            <span>{selectedSongIds.length} selected</span>
            <button onClick={removeSelectedSongs} disabled={selectedSongIds.length === 0} className={`px-3 py-1 rounded-full ${selectedSongIds.length === 0 ? "bg-white/10 text-white/40 cursor-not-allowed" : "bg-white text-black hover:opacity-90"}`}>Remove</button>
            <button onClick={toggleMultiSelect} className="px-2 py-1 rounded-full bg-white/10 hover:bg-white/15">Cancel</button>
          </div>
        </div>
      )}

      <Player />
      <Navigator />
    </>
  );
};

export default MyPlaylist;
