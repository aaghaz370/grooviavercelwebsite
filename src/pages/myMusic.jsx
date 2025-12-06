import { useState, useEffect, useRef, useContext } from "react";
import Navbar from "../components/Navbar";
import Player from "../components/Player";
import Navigator from "../components/Navigator";
import SongsList from "../components/SongsList";

import { FaHeart } from "react-icons/fa6";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

import PlaylistItems from "../components/Items/PlaylistItems";
import AlbumItems from "../components/Items/AlbumItems";
import MusicContext from "../context/MusicContext";

const MyMusic = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [likedAlbums, setLikedAlbums] = useState([]);
  const [likedPlaylists, setLikedPlaylists] = useState([]);

  // sort + custom playlists
  const [sortMode, setSortMode] = useState("recent"); // "recent" | "az" | "za"
  const [customPlaylists, setCustomPlaylists] = useState([]);
  const [activePlaylist, setActivePlaylist] = useState(null);

  // scroll refs
  const albumsScrollRef = useRef(null);
  const playlistsScrollRef = useRef(null);

  const { playMusic } = useContext(MusicContext);

  // load from localStorage
  useEffect(() => {
    const storedLikedSongs =
      JSON.parse(localStorage.getItem("likedSongs")) || [];
    const storedAlbums =
      JSON.parse(localStorage.getItem("likedAlbums")) || [];
    const storedPlaylists =
      JSON.parse(localStorage.getItem("likedPlaylists")) || [];
    const storedCustom =
      JSON.parse(localStorage.getItem("customPlaylists")) || [];

    setLikedSongs(storedLikedSongs);
    setLikedAlbums(storedAlbums);
    setLikedPlaylists(storedPlaylists);
    setCustomPlaylists(storedCustom);
  }, []);

  // sort helper
  const getSortedSongs = () => {
    const arr = [...likedSongs];
    if (sortMode === "az") {
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortMode === "za") {
      arr.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    }
    // "recent" ke liye localStorage ka order as-is
    return arr;
  };

  const sortedLikedSongs = getSortedSongs();

  const scrollLeft = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: -800, behavior: "smooth" });
  };

  const scrollRight = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: 800, behavior: "smooth" });
  };

  // --- Play All / Shuffle All only from liked songs ---
  const handlePlayAll = () => {
    if (!sortedLikedSongs.length) return;
    const first = sortedLikedSongs[0];
    playMusic(
      first.audio,
      first.name,
      first.duration,
      first.image,
      first.id,
      sortedLikedSongs
    );
  };

  const handleShuffleAll = () => {
    if (!sortedLikedSongs.length) return;
    const shuffled = [...sortedLikedSongs].sort(() => Math.random() - 0.5);
    const first = shuffled[0];
    playMusic(
      first.audio,
      first.name,
      first.duration,
      first.image,
      first.id,
      shuffled
    );
  };

  // --- Custom playlists (local only) ---
  const handleCreatePlaylist = () => {
    if (!likedSongs.length) return;
    const name = prompt("Playlist name (e.g. Road Trip, Study, Chill):");
    if (!name) return;

    const newPlaylist = {
      id: Date.now(),
      name: name.trim(),
      createdAt: Date.now(),
      songIds: likedSongs.map((s) => s.id),
    };

    const updated = [newPlaylist, ...customPlaylists];
    setCustomPlaylists(updated);
    localStorage.setItem("customPlaylists", JSON.stringify(updated));
  };

  const handleDeletePlaylist = (id) => {
    const updated = customPlaylists.filter((pl) => pl.id !== id);
    setCustomPlaylists(updated);
    localStorage.setItem("customPlaylists", JSON.stringify(updated));
    if (activePlaylist && activePlaylist.id === id) setActivePlaylist(null);
  };

  const openPlaylist = (playlist) => {
    setActivePlaylist(playlist);
  };

  const getSongsForPlaylist = (playlist) => {
    if (!playlist) return [];
    return likedSongs.filter((s) => playlist.songIds.includes(s.id));
  };

  const activePlaylistSongs = getSongsForPlaylist(activePlaylist);

  const playPlaylist = (playlist) => {
    const songs = getSongsForPlaylist(playlist);
    if (!songs.length) return;
    const first = songs[0];
    playMusic(
      first.audio,
      first.name,
      first.duration,
      first.image,
      first.id,
      songs
    );
  };

  const nothingLiked =
    likedSongs.length === 0 &&
    likedAlbums.length === 0 &&
    likedPlaylists.length === 0 &&
    customPlaylists.length === 0;

  return (
    <>
      <Navbar />
      <div className="flex flex-col mb-[12rem] gap-[1.75rem]">
        {/* HEADER */}
        <div className="lg:ml-[3rem] ml-[1.6rem] flex items-center justify-between mt-[8.5rem] lg:mt-[6rem] mr-[1.6rem]">
          <div className="flex items-center gap-3">
            <span className="flex justify-center items-center h-[3.2rem] w-[3.2rem] lg:h-[3.5rem] lg:w-[3.5rem] rounded-xl liked">
              <FaHeart className="text-2xl icon" />
            </span>
            <div className="flex flex-col">
              <span className="text-[0.7rem] uppercase tracking-[0.16em] opacity-70">
                Library
              </span>
              <h2 className="text-[1.5rem] lg:text-[1.8rem] font-semibold lg:font-bold leading-tight">
                My Music
              </h2>
              <span className="text-xs opacity-70">
                Liked songs, albums & playlists at one place
              </span>
            </div>
          </div>

          {/* New playlist button */}
          {likedSongs.length > 0 && (
            <button
              onClick={handleCreatePlaylist}
              className="text-xs px-3 py-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 backdrop-blur-sm"
            >
              + Create playlist
            </button>
          )}
        </div>

        <div className="flex gap-[1.75rem] flex-col px-[1.6rem] lg:px-[3rem]">
          {/* ---- LIKED SONGS SECTION ---- */}
          {likedSongs.length > 0 && (
            <section className="flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
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
                  {/* Sort */}
                  <select
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value)}
                    className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/15 outline-none cursor-pointer"
                  >
                    <option value="recent">Recently added</option>
                    <option value="az">Title A–Z</option>
                    <option value="za">Title Z–A</option>
                  </select>

                  {/* Play controls */}
                  <button
                    onClick={handleShuffleAll}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/15 hover:bg-white/10"
                  >
                    Shuffle
                  </button>
                  <button
                    onClick={handlePlayAll}
                    className="text-xs px-3 py-1 rounded-full bg-white text-black font-semibold hover:opacity-90"
                  >
                    Play all
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap">
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

          {/* ---- LIKED ALBUMS ---- */}
          {likedAlbums.length > 0 && (
            <section className="flex flex-col gap-2">
              <h1 className="text-lg lg:text-xl font-semibold mb-1">
                Liked Albums
              </h1>

              <div className="relative flex items-center gap-3">
                <MdOutlineKeyboardArrowLeft
                  className="arrow-btn absolute left-0 text-3xl w-[2rem] hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer h-[9rem] hidden lg:block"
                  onClick={() => scrollLeft(albumsScrollRef)}
                />
                <div
                  className="grid grid-rows-1 grid-flow-col gap-3 lg:gap-2 overflow-x-auto scroll-hide w-max px-6 lg:px-8 scroll-smooth"
                  ref={albumsScrollRef}
                >
                  {likedAlbums.map((album) => (
                    <div
                      key={album.id}
                      className="aspect-square max-w-[11rem] min-w-[9rem]"
                    >
                      <AlbumItems {...album} />
                    </div>
                  ))}
                </div>
                <MdOutlineKeyboardArrowRight
                  className="arrow-btn absolute right-0 text-3xl w-[2rem] hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer h-[9rem] hidden lg:block"
                  onClick={() => scrollRight(albumsScrollRef)}
                />
              </div>
            </section>
          )}

          {/* ---- LIKED PLAYLISTS (Saavn playlists) ---- */}
          {likedPlaylists.length > 0 && (
            <section className="flex flex-col gap-2">
              <h1 className="text-lg lg:text-xl font-semibold mb-1">
                Liked Playlists
              </h1>

              <div className="relative flex items-center gap-3">
                <MdOutlineKeyboardArrowLeft
                  className="arrow-btn absolute left-0 text-3xl w-[2rem] hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer h-[9rem] hidden lg:block"
                  onClick={() => scrollLeft(playlistsScrollRef)}
                />

                <div
                  className="grid grid-rows-1 grid-flow-col gap-3 lg:gap-[0.66rem] overflow-x-auto scroll-hide w-max px-6 lg:px-8 scroll-smooth"
                  ref={playlistsScrollRef}
                >
                  {likedPlaylists.map((playlist) => (
                    <PlaylistItems key={playlist.id} {...playlist} />
                  ))}
                </div>

                <MdOutlineKeyboardArrowRight
                  className="arrow-btn absolute right-0 text-3xl w-[2rem] hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer h-[9rem] hidden lg:block "
                  onClick={() => scrollRight(playlistsScrollRef)}
                />
              </div>
            </section>
          )}

          {/* ---- CUSTOM PLAYLISTS (LOCAL) ---- */}
          {customPlaylists.length > 0 && (
            <section className="flex flex-col gap-2">
              <h1 className="text-lg lg:text-xl font-semibold mb-1">
                My Playlists
              </h1>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {customPlaylists.map((pl) => (
                  <div
                    key={pl.id}
                    className="card p-3 rounded-xl border border-white/10 hover:border-white/25 transition cursor-pointer flex justify-between items-center"
                    onClick={() => openPlaylist(pl)}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{pl.name}</span>
                      <span className="text-[0.7rem] opacity-70">
                        {pl.songIds.length} song
                        {pl.songIds.length > 1 ? "s" : ""} • Custom playlist
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(pl.id);
                      }}
                      className="text-[0.7rem] px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/15"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* EMPTY STATE */}
          {nothingLiked && (
            <div className="mt-4 text-sm opacity-80">
              No liked songs, albums or playlists yet. Start exploring and tap
              the ♥ icon on anything you love.
            </div>
          )}
        </div>
      </div>

      {/* PLAYLIST MODAL */}
      {activePlaylist && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#09090B] w-[95%] max-w-[550px] max-h-[80vh] rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex flex-col">
                <span className="text-xs opacity-70 uppercase tracking-[0.16em]">
                  Custom playlist
                </span>
                <h2 className="text-lg font-semibold">{activePlaylist.name}</h2>
                <span className="text-xs opacity-70">
                  {activePlaylistSongs.length} song
                  {activePlaylistSongs.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => playPlaylist(activePlaylist)}
                  className="text-xs px-3 py-1 rounded-full bg-white text-black font-semibold hover:opacity-90"
                >
                  Play
                </button>
                <button
                  onClick={() => setActivePlaylist(null)}
                  className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/20 hover:bg-white/15"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="overflow-y-auto pr-1">
              {activePlaylistSongs.length === 0 && (
                <div className="text-xs opacity-70">
                  No songs found (maybe removed from liked songs).
                </div>
              )}
              {activePlaylistSongs.map((song, index) => (
                <SongsList
                  key={song.id || index}
                  id={song.id}
                  image={song.image}
                  artists={song.artists}
                  name={song.name}
                  duration={song.duration}
                  downloadUrl={song.audio}
                  song={activePlaylistSongs}
                />
              ))}
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
