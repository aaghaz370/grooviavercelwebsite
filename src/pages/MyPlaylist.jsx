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

  // songs to render (first 50, then show more)
  const visibleSongs = playlist.songs.slice(0, visibleCount);
  const hasMore = playlist.songs.length > visibleCount;

  return (
    <>
      <Navbar />

      <div className="min-h-[calc(100vh-6rem)] flex flex-col pb-40 px-[1.6rem] lg:px-[3rem] mt-[7.5rem] lg:mt-[5.5rem]">
        {/* HEADER – big card like YT Music */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6">
          {/* cover + meta */}
          <div className="flex items-start gap-4">
            <div className="h-[5rem] w-[5rem] lg:h-[6rem] lg:w-[6rem] rounded-xl overflow-hidden shadow-xl shadow-black/40 bg-white/5">
              <img
                src={cover}
                alt={playlist.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[0.7rem] uppercase tracking-[0.16em] opacity-70">
                Custom playlist
              </span>
              <h1 className="text-[1.5rem] lg:text-[1.9rem] font-semibold leading-tight">
                {playlist.name}
              </h1>
              <span className="text-[0.8rem] opacity-70">
                {playlist.songs.length} song
                {playlist.songs.length > 1 ? "s" : ""} • {totalDurationLabel}
              </span>
              <span className="text-[0.7rem] opacity-60">
                Tap a song to play · Long press / three dots for options
              </span>
            </div>
          </div>

          {/* right actions */}
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(-1)}
                className="hidden sm:inline-flex text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/15 hover:bg-white/10"
              >
                Back
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/15 hover:bg-white/10"
              >
                Add songs
              </button>
              {playlist.songs.length > 0 && (
                <>
                  <button
                    onClick={handlePlayAll}
                    className="text-xs px-3.5 py-1.5 rounded-full bg-white text-black font-semibold hover:opacity-90 flex items-center gap-1"
                  >
                    <FaPlay className="text-[0.7rem]" />
                    Play
                  </button>
                  <button
                    onClick={handleShufflePlay}
                    className="text-xs px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 flex items-center gap-1"
                  >
                    <PiShuffleBold className="text-[0.9rem]" />
                    Shuffle
                  </button>
                </>
              )}

              {/* header menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setHeaderMenuOpen((v) => !v);
                    setOpenSongMenuId(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10"
                >
                  <BsThreeDotsVertical />
                </button>

                {headerMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setHeaderMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-9 w-48 bg-[#020617] rounded-2xl border border-white/10 shadow-2xl text-xs z-20 overflow-hidden">
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2"
                        onClick={handlePlayAll}
                      >
                        <FaPlay className="text-[0.7rem]" />
                        Play all
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2"
                        onClick={handleShufflePlay}
                      >
                        <PiShuffleBold className="text-sm" />
                        Shuffle play
                      </button>
                      <div className="h-px bg-white/10 my-1" />
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-white/10"
                        onClick={openRename}
                      >
                        Rename playlist
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-white/10"
                        onClick={toggleMultiSelect}
                      >
                        {multiSelectMode
                          ? "Cancel multi select"
                          : "Select multiple songs"}
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-white/10 text-red-300"
                        onClick={handleDeletePlaylist}
                      >
                        Delete playlist
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* mobile back button */}
            <button
              onClick={() => navigate(-1)}
              className="sm:hidden self-end text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/15 hover:bg-white/10"
            >
              Back
            </button>
          </div>
        </div>

        {/* SONG LIST – clean like YT Music */}
        <div className="mt-2 flex flex-col">
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
                            className="w-full text-left px-3 py-2 hover:bg-white/10 text-red-300"
                            onClick={() => handleRemoveSong(song.id)}
                          >
                            Remove from playlist
                          </button>
                        </div>
                      </>
                    )}
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
            <h2 className="text-sm font-semibold mb-2">
              Related playlists
            </h2>
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
