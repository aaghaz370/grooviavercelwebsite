// src/pages/MyMusic.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import Navbar from "../components/Navbar";
import Player from "../components/Player";
import Navigator from "../components/Navigator";
import SongsList from "../components/SongsList";
import PlaylistItems from "../components/Items/PlaylistItems";
import { fetchAlbumByID } from "../../fetch"; // path tumhare project ka

import { FaHeart } from "react-icons/fa6";

const MyMusic = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [likedAlbums, setLikedAlbums] = useState([]);
  const [likedPlaylists, setLikedPlaylists] = useState([]);
  const [albumTrackMap, setAlbumTrackMap] = useState({}); // { [albumId]: songs[] }

  const [sortMode, setSortMode] = useState("recent"); // recent | az | za

  // custom playlists: { id, name, createdAt, songs: [songObj] }
  const [customPlaylists, setCustomPlaylists] = useState([]);

  // create playlist modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedSongIds, setSelectedSongIds] = useState([]);

  const albumsScrollRef = useRef(null);

  // --------- LocalStorage se data load ----------
  useEffect(() => {
    const storedLikedSongs =
      JSON.parse(localStorage.getItem("likedSongs")) || [];
    const storedAlbums =
      JSON.parse(localStorage.getItem("likedAlbums")) || [];
    const storedPlaylists =
      JSON.parse(localStorage.getItem("likedPlaylists")) || [];
    const storedCustom =
      JSON.parse(localStorage.getItem("customPlaylists")) || [];

    // custom playlist migration (old structure → new)
    const migratedCustom = (storedCustom || []).map((pl) => {
      if (pl.songs && Array.isArray(pl.songs)) return pl;

      if (pl.songIds && Array.isArray(pl.songIds)) {
        const songs = storedLikedSongs.filter((s) =>
          pl.songIds.includes(s.id)
        );
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

    setLikedSongs(storedLikedSongs);
    setLikedAlbums(storedAlbums);
    setLikedPlaylists(storedPlaylists);
    setCustomPlaylists(migratedCustom);

    localStorage.setItem("customPlaylists", JSON.stringify(migratedCustom));
  }, []);

  // --------- Har liked album ke liye songs fetch (sirf ek baar per album) ----------
  useEffect(() => {
    const loadAlbumSongs = async () => {
      try {
        const missing = likedAlbums.filter(
          (alb) => alb.id && !albumTrackMap[alb.id]
        );

        for (const alb of missing) {
          const res = await fetchAlbumByID(alb.id);
          const songs = res?.data?.[0]?.songs || [];

          setAlbumTrackMap((prev) => ({
            ...prev,
            [alb.id]: songs,
          }));
        }
      } catch (err) {
        console.error("Error loading album songs for MyMusic:", err);
      }
    };

    if (likedAlbums.length) {
      loadAlbumSongs();
    }
  }, [likedAlbums, albumTrackMap]);

  // --------- Helpers ----------
  const getSortedSongs = () => {
    const arr = [...likedSongs];
    if (sortMode === "az") {
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortMode === "za") {
      arr.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    }
    return arr;
  };

  const sortedLikedSongs = getSortedSongs();

  const handlePlayAll = () => {
    if (!sortedLikedSongs.length) return;
    // queue logic tum baad me add kar sakte ho
  };

  const handleShuffleAll = () => {
    if (!sortedLikedSongs.length) return;
    // shuffle logic baad me
  };

  // playlist creation
  const openCreatePlaylist = () => {
    if (!likedSongs.length) return;
    setNewPlaylistName("");
    setSelectedSongIds([]);
    setIsCreateModalOpen(true);
  };

  const toggleSelectSong = (id) => {
    setSelectedSongIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreatePlaylistSave = () => {
    const name = newPlaylistName.trim();
    if (!name || selectedSongIds.length === 0) return;

    const songs = likedSongs
      .filter((s) => selectedSongIds.includes(s.id))
      .map((s) => ({ ...s }));

    const newPlaylist = {
      id: Date.now(),
      name,
      createdAt: Date.now(),
      songs,
    };

    const updated = [newPlaylist, ...customPlaylists];
    setCustomPlaylists(updated);
    localStorage.setItem("customPlaylists", JSON.stringify(updated));

    setIsCreateModalOpen(false);
  };

  const handleDeletePlaylist = (id) => {
    const updated = customPlaylists.filter((pl) => pl.id !== id);
    setCustomPlaylists(updated);
    localStorage.setItem("customPlaylists", JSON.stringify(updated));
  };

  const getPlaylistCover = (playlist) =>
    playlist.songs?.[0]?.image || "/Unknown.png";

  const nothingLiked =
    likedSongs.length === 0 &&
    likedAlbums.length === 0 &&
    likedPlaylists.length === 0 &&
    customPlaylists.length === 0;

  // --------- UI ----------
  return (
    <>
      <Navbar />

      {/* min-h-screen → niche black patch nahi aayega */}
      <div className="flex flex-col min-h-screen mb-[12rem] gap-[1.75rem]">
        {/* HEADER CARD */}
        <div className="mt-[8.5rem] lg:mt-[6rem] px-[1.6rem] lg:px-[3rem]">
          <div className="card flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex justify-center items-center h-[3.2rem] w-[3.2rem] lg:h-[3.5rem] lg:w-[3.5rem] rounded-xl liked">
                <FaHeart className="text-2xl icon" />
              </span>
              <div className="flex flex-col">
                <span className="text-[0.7rem] uppercase tracking-[0.16em] opacity-70">
                  Library
                </span>
                <h2 className="text-[1.5rem] lg:text-[1.8rem] font-semibold leading-tight">
                  My Music
                </h2>
                <span className="text-xs opacity-70">
                  Liked songs, albums & playlists at one place
                </span>
              </div>
            </div>

            {likedSongs.length > 0 && (
              <button
                onClick={openCreatePlaylist}
                className="text-xs px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15"
              >
                + Create playlist
              </button>
            )}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-col gap-[1.75rem] px-[1.6rem] lg:px-[3rem]">
          {/* -------- LIKED SONGS -------- */}
          {likedSongs.length > 0 && (
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex flex-col">
                  <h3 className="text-lg lg:text-xl font-semibold">
                    Liked Songs
                  </h3>
                  <span className="text-xs opacity-70">
                    {likedSongs.length} song
                    {likedSongs.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/15 outline-none cursor-pointer"
                  >
                    <option value="recent">Recently added</option>
                    <option value="az">Title A–Z</option>
                    <option value="za">Title Z–A</option>
                  </select>
                  <button
                    onClick={handleShuffleAll}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/15 hover:bg-white/10"
                  >
                    Shuffle
                  </button>
                  <button
                    onClick={handlePlayAll}
                    className="text-xs px-3.5 py-1.5 rounded-full bg-white text-black font-semibold hover:opacity-90"
                  >
                    Play all
                  </button>
                </div>
              </div>

              {/* songs ke beech halka gap */}
              <div className="flex flex-wrap gap-y-2">
                {sortedLikedSongs.map(
                  (song, index) =>
                    song && (
                      <SongsList
                        key={song.id || index}
                        id={song.id}
                        image={song.image}
                        artists={song.artists}
                        name={song.name}
                        duration={song.duration}
                        downloadUrl={song.audio}
                        song={sortedLikedSongs}
                      />
                    )
                )}
              </div>
            </section>
          )}

          {/* LIKED ALBUMS – same style as Liked Playlists cards */}
{likedAlbums.length > 0 && (
  <section className="flex flex-col gap-2">
    <h1 className="text-lg lg:text-xl font-semibold mb-1">
      Liked Albums
    </h1>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
      {likedAlbums.map((album) => {
        const title =
          album.name || album.title || album.album || "Unknown Album";

        const artist =
          album.primaryArtists ||
          album.artist ||
          album.subtitle ||
          "";

        const cover = album.image || album.thumbnail || "/Unknown.png";

        return (
          <Link key={album.id} to={`/albums/${album.id}`}>
            <div className="w-full group cursor-pointer">
              {/* square image – same feel as playlist card */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5">
                <img
                  src={cover}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* text info */}
              <div className="mt-1.5 flex flex-col">
                <span className="text-sm font-semibold truncate">
                  {title}
                </span>
                {artist && (
                  <span className="text-xs opacity-70 truncate">
                    {artist}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  </section>
)}

          {/* -------- LIKED PLAYLISTS -------- */}
          {likedPlaylists.length > 0 && (
            <section className="flex flex-col gap-2">
              <h1 className="text-lg lg:text-xl font-semibold mb-1">
                Liked Playlists
              </h1>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
                {likedPlaylists.map((playlist) => (
                  <div key={playlist.id} className="w-full">
                    <PlaylistItems {...playlist} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* -------- CUSTOM PLAYLISTS -------- */}
          {customPlaylists.length > 0 && (
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h1 className="text-lg lg:text-xl font-semibold">
                  My Playlists
                </h1>
                <span className="text-xs opacity-70">
                  {customPlaylists.length} playlist
                  {customPlaylists.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 lg:gap-4">
                {customPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    className="w-[47%] sm:w-[31%] md:w-[23%] lg:w-[18%] min-w-[130px] flex flex-col gap-1"
                  >
                    <Link to={`/my-playlists/${pl.id}`}>
                      <div className="aspect-square rounded-xl overflow-hidden bg-white/5">
                        <img
                          src={getPlaylistCover(pl)}
                          alt={pl.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </Link>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold truncate">
                        {pl.name}
                      </span>
                      <span className="text-xs opacity-70">
                        {pl.songs.length} song
                        {pl.songs.length > 1 ? "s" : ""} • Custom playlist
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeletePlaylist(pl.id)}
                      className="self-start mt-1 text-[0.7rem] px-2.5 py-1 rounded-full bg-white/5 border border-white/15 hover:bg-white/10"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* -------- EMPTY STATE -------- */}
          {nothingLiked && (
            <div className="mt-4 text-sm opacity-80">
              No liked songs, albums or playlists yet. Start exploring and tap
              the ♥ icon on anything you love.
            </div>
          )}
        </div>
      </div>

      {/* CREATE PLAYLIST MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#09090B] w-[95%] max-w-[550px] max-h-[80vh] rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex flex-col">
                <span className="text-xs opacity-70 uppercase tracking-[0.16em]">
                  New playlist
                </span>
                <h2 className="text-lg font-semibold">Create playlist</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 hover:bg-white/15"
              >
                Close
              </button>
            </div>

            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg bg-white/5 border border-white/15 outline-none"
            />

            <span className="text-[0.7rem] opacity-70 mt-1">
              Choose songs from your liked songs
            </span>

            <div className="overflow-y-auto max-h-[50vh] pr-1">
              {likedSongs.map((song) => (
                <label
                  key={song.id}
                  className="flex items-center gap-3 py-1.5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSongIds.includes(song.id)}
                    onChange={() => toggleSelectSong(song.id)}
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
                onClick={() => setIsCreatePlaylist(false)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs px-3.5 py-1.5 rounded-full bg-white text-black font-semibold hover:opacity-90"
              >
                Create
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

export default MyMusic;
