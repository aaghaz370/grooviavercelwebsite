// src/pages/PlaylistDetails.jsx
import { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Player from "../components/Player";
import Navigator from "../components/Navigator";
import Footer from "../components/footer";

import {
  fetchplaylistsByID,
  searchPlayListByQuery,
} from "../../fetch";

import PlaylistSlider from "../components/Sliders/PlaylistSlider";
import ArtistSlider from "../components/Sliders/ArtistSlider";
import MusicContext from "../context/MusicContext";

import { FaHeart, FaRegHeart, FaPlay, FaPause } from "react-icons/fa";
import { PiShuffleBold } from "react-icons/pi";
import he from "he";

const PlaylistDetails = () => {
  const { id } = useParams();
  const {
    playMusic,
    currentSong,
    isPlaying,
    shuffle,
    toggleShuffle,
  } = useContext(MusicContext);

  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [likedPlaylists, setLikedPlaylists] = useState(() => {
    return JSON.parse(localStorage.getItem("likedPlaylists")) || [];
  });

  const [similarPlaylists, setSimilarPlaylists] = useState([]);
  const [trendingPlaylists, setTrendingPlaylists] = useState([]);
  const [playlistArtists, setPlaylistArtists] = useState([]);

  // YT Music style – first 50, then Show more
  const [visibleCount, setVisibleCount] = useState(50);

  // fetch playlist
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchplaylistsByID(id);
        setDetails(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch playlist details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const playlistData = details.data || {};
  const songs = playlistData.songs || [];

  // playlist cover / fallback
  const playlistImage =
    playlistData.image?.[2]?.url ||
    playlistData.image?.[1]?.url ||
    playlistData.image?.[0]?.url ||
    "/Unknown.png";

  // persist likes
  useEffect(() => {
    localStorage.setItem("likedPlaylists", JSON.stringify(likedPlaylists));
  }, [likedPlaylists]);

  const isPlaylistLiked = likedPlaylists.some((p) => p.id === playlistData.id);

  const toggleLikePlaylist = () => {
    setLikedPlaylists((prev) => {
      const exists = prev.some((p) => p.id === playlistData.id);
      if (exists) return prev.filter((p) => p.id !== playlistData.id);
      return [
        ...prev,
        { id: playlistData.id, name: playlistData.name, image: playlistImage },
      ];
    });
  };

  // assemble artists list
  useEffect(() => {
    if (!playlistData || !songs.length) return;
    const songArtists = songs.flatMap((s) => s.artists?.primary || []) || [];
    const topArtists = playlistData.artists || [];
    const all = [...songArtists, ...topArtists];
    const unique = all.filter(
      (a, i, self) => a.id && i === self.findIndex((t) => t.id === a.id)
    );
    setPlaylistArtists(unique);
  }, [details]); // eslint-disable-line

  // similar + trending
  useEffect(() => {
    if (!playlistData || !playlistData.id) return;

    const fetchExtra = async () => {
      try {
        const primaryArtistName =
          playlistData.artists?.[0]?.name ||
          songs?.[0]?.artists?.primary?.[0]?.name ||
          null;

        const baseQuery =
          primaryArtistName ||
          playlistData.name?.split("-")[0].trim() ||
          playlistData.name;

        const lang = playlistData.language || "hindi";

        const [similarRes, trendingRes] = await Promise.all([
          searchPlayListByQuery(baseQuery),
          searchPlayListByQuery("Top " + lang),
        ]);

        const allSimilar = similarRes?.data?.results || [];
        const filteredSimilar = allSimilar
          .filter((p) => p.id !== playlistData.id)
          .slice(0, 10);

        const trending = (trendingRes?.data?.results || []).slice(0, 10);

        setSimilarPlaylists(filteredSimilar);
        setTrendingPlaylists(trending);
      } catch (e) {
        console.error("extra playlist fetch error", e);
      }
    };

    fetchExtra();
  }, [details]); // eslint-disable-line

  // duration + totals
  const { totalSongs, totalDurationLabel } = useMemo(() => {
    const totalSongsLocal = songs.length;
    const totalSeconds = songs.reduce((sum, s) => sum + (s.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    let label = "";
    if (hours > 0) label += `${hours} hr `;
    label += `${minutes} min`;
    return { totalSongs: totalSongsLocal, totalDurationLabel: label };
  }, [songs]);

  // safe song image
  const getSongImage = (song) =>
    song.image?.[1]?.url || song.image?.[2]?.url || song.image?.[0]?.url || playlistImage;

  // play single
  const playSingleSong = (song, queueOverride) => {
    const queue = queueOverride || songs;
    const audioSource = song.downloadUrl
      ? song.downloadUrl[4]?.url || song.downloadUrl[3]?.url || song.downloadUrl[0]?.url
      : song.audio;

    const { name, duration, image, id, artists } = song;

    playMusic(audioSource, name, duration, image || getSongImage(song), id, artists, queue);
  };

  const playFirstSong = () => {
    if (!songs.length) return;
    playSingleSong(songs[0], songs);
  };

  const shuffleArray = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const shufflePlay = () => {
    if (!songs.length) return;
    const shuffled = shuffleArray(songs);
    playSingleSong(shuffled[0], shuffled);
  };

  // remove noisy From "..." tokens from title
  const sanitizeTitle = (raw) => {
    if (!raw) return "";
    let decoded = he.decode(raw);
    decoded = decoded.replace(/\(From\s*["'“”](.*?)["'“”]\)/gi, "($1)");
    decoded = decoded.replace(/From\s*["'“”](.*?)["'“”]/gi, "($1)");
    decoded = decoded.replace(/From\s*&quot;?/gi, "");
    decoded = decoded.replace(/&quot;/gi, "");
    return decoded.trim();
  };

  const visibleSongs = songs.slice(0, visibleCount);
  const hasMore = songs.length > visibleCount;

  // detect if this playlist currently playing
  const isPlaylistPlaying = Boolean(currentSong && songs.some((s) => s.id === currentSong.id));

  if (loading) {
    return (
      <div className="flex h-screen w-screen justify-center items-center">
        <img src="/Loading.gif" alt="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen justify-center items-center text-red-500 text-lg">
        {error}
      </div>
    );
  }

  return (
    <>
      <Navbar />

      {/* HERO / banner — large top background like YT Music */}
      <div
        className="relative w-full h-[22rem] lg:h-[28rem] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(2,6,23,0.8), rgba(2,6,23,0.9)), url(${playlistImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(0.95)",
        }}
      >
        {/* dim + subtle blur overlay */}
        <div className="absolute inset-0 backdrop-blur-sm" />

        {/* content container overlapping bottom */}
        <div className="absolute left-0 right-0 bottom-0 px-[1.6rem] lg:px-[3rem] pb-6">
          <div className="flex items-end gap-6">
            <div className="transform translate-y-6">
              <div className="h-[9.5rem] w-[9.5rem] lg:h-[12rem] lg:w-[12rem] rounded-2xl overflow-hidden shadow-2xl border border-white/6">
                <img src={playlistImage} alt={playlistData.name || "Playlist"} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex-1 text-left translate-y-6">
              {/* removed the small 'Playlist' chip per request */}
              <h1 className="text-2xl lg:text-4xl font-extrabold text-white leading-tight">
                {playlistData.name}
              </h1>
              <div className="mt-2 text-sm lg:text-base text-white/80">
                {totalSongs} song{totalSongs !== 1 ? "s" : ""} • {totalDurationLabel}
              </div>
              {playlistData.description && (
                <div className="mt-2 text-sm text-white/70 line-clamp-2">
                  {playlistData.description}
                </div>
              )}

              {/* controls row: left small shuffle icon, center big play/pause circle, right small like */}
              <div className="mt-4 flex items-center gap-4">
                {/* shuffle (small) */}
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
                      // pause — call playMusic again to toggle (keeps your existing implementation)
                      playMusic(
                        currentSong?.audio?.currentSrc,
                        currentSong?.name,
                        currentSong?.duration,
                        currentSong?.image,
                        currentSong?.id,
                        songs
                      );
                    } else {
                      // start playlist
                      playFirstSong();
                    }
                  }}
                  className="h-16 w-16 rounded-full flex items-center justify-center bg-white text-black shadow-lg transform active:scale-95"
                  title={isPlaylistPlaying && isPlaying ? "Pause" : "Play"}
                >
                  {isPlaylistPlaying && isPlaying ? <FaPause className="text-2xl" /> : <FaPlay className="text-2xl" />}
                </button>

                {/* like (small) */}
                <button
                  onClick={toggleLikePlaylist}
                  className="h-11 w-11 rounded-full flex items-center justify-center bg-white/6 text-white/80"
                  title="Like playlist"
                >
                  {isPlaylistLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* page content below hero */}
      <div className="flex flex-col mt-2 px-[1.6rem] lg:px-[3rem] pb-32 -mt-12">
        {/* songs list YT-like */}
        <div className="mt-4">
          {songs.length === 0 && <div className="text-sm opacity-70">Playlist is empty...</div>}

          {visibleSongs.map((song, idx) => {
            const artists = song.artists?.primary?.map((a) => a.name).join(", ") || "";
            const songImg = getSongImage(song);
            const displayName = sanitizeTitle(song.name || song.title);

            return (
              <button
                key={song.id || `${song.name}-${idx}`}
                className="flex items-center justify-between w-full px-2 py-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors text-left"
                onClick={() => playSingleSong(song)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img src={songImg} alt={song.name} className="h-12 w-12 rounded-md object-cover" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{displayName}</span>
                    <span className="text-[0.8rem] opacity-70 truncate">{artists}</span>
                  </div>
                </div>

                <span className="ml-3 text-[0.8rem] opacity-70">
                  {song.duration ? new Date(song.duration * 1000).toISOString().substring(14, 19) : ""}
                </span>
              </button>
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

        {/* extras */}
        {similarPlaylists.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold mb-2">Similar playlists</h2>
            <PlaylistSlider playlists={similarPlaylists} />
          </div>
        )}

        {trendingPlaylists.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold mb-2">Trending playlists</h2>
            <PlaylistSlider playlists={trendingPlaylists} />
          </div>
        )}

        {playlistArtists.length > 0 && (
          <div className="mt-8 mb-6">
            <h2 className="text-sm font-semibold mb-2">Artists in this playlist</h2>
            <ArtistSlider artists={playlistArtists} />
          </div>
        )}
      </div>

      <Player />
      <Navigator />
      <Footer />
    </>
  );
};

export default PlaylistDetails;
