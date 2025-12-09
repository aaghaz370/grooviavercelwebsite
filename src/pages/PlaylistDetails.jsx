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

import { FaHeart, FaRegHeart, FaPlay } from "react-icons/fa6";
import { PiShuffleBold } from "react-icons/pi";

const PlaylistDetails = () => {
  const { id } = useParams();
  const { playMusic } = useContext(MusicContext);

  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [likedPlaylists, setLikedPlaylists] = useState(() => {
    return JSON.parse(localStorage.getItem("likedPlaylists")) || [];
  });

  const [similarPlaylists, setSimilarPlaylists] = useState([]);
  const [trendingPlaylists, setTrendingPlaylists] = useState([]);
  const [playlistArtists, setPlaylistArtists] = useState([]);

  // YT Music style: first 50 songs, then "Show more"
  const [visibleCount, setVisibleCount] = useState(50);

  // -------------------------------------------
  // 1) Fetch playlist detail
  // -------------------------------------------
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

  // playlistData shorthand
  const playlistData = details.data || {};
  const songs = playlistData.songs || [];

  // playlist cover
  const playlistImage =
    playlistData.image?.[2]?.url || playlistData.image?.[0]?.url || "/Unknown.png";

  // -------------------------------------------
  // 2) Liked playlists -> localStorage
  // -------------------------------------------
  useEffect(() => {
    localStorage.setItem("likedPlaylists", JSON.stringify(likedPlaylists));
  }, [likedPlaylists]);

  const toggleLikePlaylist = () => {
    setLikedPlaylists((prev) => {
      const exists = prev.some((p) => p.id === playlistData.id);
      if (exists) {
        return prev.filter((p) => p.id !== playlistData.id);
      }
      return [
        ...prev,
        {
          id: playlistData.id,
          name: playlistData.name,
          image: playlistImage,
        },
      ];
    });
  };

  const isPlaylistLiked = likedPlaylists.some(
    (p) => p.id === playlistData.id
  );

  // -------------------------------------------
  // 3) Artists list (unique)
  // -------------------------------------------
  useEffect(() => {
    if (!playlistData || !songs.length) return;

    const songArtists =
      songs.flatMap((s) => s.artists?.primary || []) || [];

    const topArtists = playlistData.artists || [];
    const all = [...songArtists, ...topArtists];

    const unique = all.filter(
      (a, i, self) => a.id && i === self.findIndex((t) => t.id === a.id)
    );

    setPlaylistArtists(unique);
  }, [details]); // eslint-disable-line react-hooks/exhaustive-deps

  // -------------------------------------------
  // 4) Similar & Trending playlists
  // -------------------------------------------
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
  }, [details]); // eslint-disable-line react-hooks/exhaustive-deps

  // -------------------------------------------
  // 5) Duration calculation (YT Music style)
  // -------------------------------------------
  const { totalSongs, totalDurationLabel } = useMemo(() => {
    const totalSongsLocal = songs.length;
    const totalSeconds = songs.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    let label = "";
    if (hours > 0) label += `${hours} hr `;
    label += `${minutes} min`;
    return { totalSongs: totalSongsLocal, totalDurationLabel: label };
  }, [songs]);

  // -------------------------------------------
  // 6) Play helpers
  // -------------------------------------------
  const playFirstSong = () => {
    if (!songs.length) return;
    const firstSong = songs[0];
    const audioSource = firstSong.downloadUrl
      ? firstSong.downloadUrl[4]?.url || firstSong.downloadUrl[0]?.url
      : firstSong.audio;

    const { name, duration, image, id, artists } = firstSong;

    // same signature jo tum already use kar rahe the
    playMusic(
      audioSource,
      name,
      duration,
      image,
      id,
      artists,
      songs
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

  const shufflePlay = () => {
    if (!songs.length) return;
    const shuffled = shuffleArray(songs);
    const firstSong = shuffled[0];
    const audioSource = firstSong.downloadUrl
      ? firstSong.downloadUrl[4]?.url || firstSong.downloadUrl[0]?.url
      : firstSong.audio;

    const { name, duration, image, id, artists } = firstSong;

    playMusic(
      audioSource,
      name,
      duration,
      image,
      id,
      artists,
      shuffled
    );
  };

  const playSingleSong = (song) => {
    const audioSource = song.downloadUrl
      ? song.downloadUrl[4]?.url || song.downloadUrl[0]?.url
      : song.audio;

    const { name, duration, image, id, artists } = song;

    playMusic(
      audioSource,
      name,
      duration,
      image,
      id,
      artists,
      songs
    );
  };

  // songs to display (first 50, "Show more" for rest)
  const visibleSongs = songs.slice(0, visibleCount);
  const hasMore = songs.length > visibleCount;

  // -------------------------------------------
  // 7) Loading / error
  // -------------------------------------------
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

  // -------------------------------------------
  // 8) UI
  // -------------------------------------------
  return (
    <>
      <Navbar />

      <div className="flex flex-col mt-[7.5rem] lg:mt-[5.5rem] px-[1.6rem] lg:px-[3rem] pb-32">
        {/* HEADER – YT Music style */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
          {/* left: cover + meta */}
          <div className="flex items-start gap-4">
            <div className="h-[7rem] w-[7rem] lg:h-[8rem] lg:w-[8rem] rounded-2xl overflow-hidden bg-white/5 shadow-xl shadow-black/40 DetailImg">
              <img
                src={playlistImage}
                alt={playlistData.name || "Playlist"}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[0.7rem] uppercase tracking-[0.16em] opacity-70">
                Saavn playlist
              </span>
              <h1 className="text-[1.6rem] lg:text-[1.9rem] font-semibold leading-tight">
                {playlistData.name}
              </h1>
              <span className="text-[0.8rem] opacity-70">
                {totalSongs} song{totalSongs !== 1 ? "s" : ""} •{" "}
                {totalDurationLabel}
              </span>
              {playlistData.description && (
                <span className="text-[0.75rem] opacity-60 line-clamp-2">
                  {playlistData.description}
                </span>
              )}
            </div>
          </div>

          {/* right actions */}
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2">
              {songs.length > 0 && (
                <>
                  <button
                    onClick={playFirstSong}
                    className="flex items-center gap-1 text-xs px-3.5 py-1.5 rounded-full bg-white text-black font-semibold hover:opacity-90"
                  >
                    <FaPlay className="text-[0.7rem]" />
                    Play
                  </button>
                  <button
                    onClick={shufflePlay}
                    className="flex items-center gap-1 text-xs px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/15"
                  >
                    <PiShuffleBold className="text-[0.9rem]" />
                    Shuffle
                  </button>
                </>
              )}
              <button
                onClick={toggleLikePlaylist}
                title="Like Playlist"
                className="flex items-center justify-center h-[2.6rem] w-[2.6rem] rounded-full border border-white/20 bg-white/5 hover:bg-white/10"
              >
                {isPlaylistLiked ? (
                  <FaHeart className="text-red-500 text-xl" />
                ) : (
                  <FaRegHeart className="text-xl" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* SONG LIST – clean, numbered, minimal hover */}
        <div className="mt-2 flex flex-col">
          {songs.length === 0 && (
            <div className="text-xs opacity-70">
              Playlist is empty...
            </div>
          )}

          {visibleSongs.map((song, idx) => {
            const trackNumber = idx + 1;
            const artists =
              song.artists?.primary?.map((a) => a.name).join(", ") || "";

            return (
              <div
                key={song.id || `${song.name}-${idx}`}
                className="flex items-center justify-between px-2 py-1.5 rounded-xl transition-colors"
                onClick={() => playSingleSong(song)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* track index */}
                  <span className="w-6 text-[0.7rem] text-right opacity-60">
                    {trackNumber}
                  </span>

                  <img
                    src={song.image || playlistImage}
                    alt={song.name}
                    className="h-9 w-9 rounded-md object-cover"
                  />

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">
                      {song.name}
                    </span>
                    <span className="text-[0.7rem] opacity-70 truncate">
                      {artists}
                    </span>
                  </div>
                </div>

                <span className="text-[0.7rem] opacity-70 ml-2">
                  {song.duration
                    ? new Date(song.duration * 1000)
                        .toISOString()
                        .substring(14, 19)
                    : ""}
                </span>
              </div>
            );
          })}

          {/* Show more button like YT Music */}
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

        {/* Similar Playlists */}
        {similarPlaylists.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold mb-2">
              Similar playlists
            </h2>
            <PlaylistSlider playlists={similarPlaylists} />
          </div>
        )}

        {/* Trending Playlists */}
        {trendingPlaylists.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold mb-2">
              Trending playlists
            </h2>
            <PlaylistSlider playlists={trendingPlaylists} />
          </div>
        )}

        {/* Artists in this playlist */}
        {playlistArtists.length > 0 && (
          <div className="mt-8 mb-6">
            <h2 className="text-sm font-semibold mb-2">
              Artists in this playlist
            </h2>
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
