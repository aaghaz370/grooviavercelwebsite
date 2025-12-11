// src/pages/AlbumDetail.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Player from "../components/Player";
import Navigator from "../components/Navigator";
import Footer from "../components/footer";

import {
  fetchAlbumByID,
  getSuggestionSong,
  searchAlbumByQuery,
} from "../../fetch";

import AlbumSlider from "../components/Sliders/AlbumSlider";
import ArtistSlider from "../components/Sliders/ArtistSlider";
import MusicContext from "../context/MusicContext";

import { FaHeart, FaRegHeart, FaPlay, FaPause } from "react-icons/fa";
import { PiShuffleBold } from "react-icons/pi";

const AlbumDetail = () => {
  const { id } = useParams();

  // proper useContext import & usage
  const ctx = useContext(MusicContext) || {};
  const playMusic = ctx.playMusic || (() => {});
  const currentSong = ctx.currentSong || null;
  const isPlaying = typeof ctx.isPlaying === "boolean" ? ctx.isPlaying : false;
  const shuffle = Boolean(ctx.shuffle);
  const toggleShuffle = ctx.toggleShuffle || (() => {});

  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggetions, setSuggetion] = useState([]);
  const [similarAlbums, setSimilarAlbums] = useState([]);
  const [albumArtists, setAlbumArtists] = useState([]);
  const [likedAlbums, setLikedAlbums] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("likedAlbums")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchAlbumByID(id);
        setDetails(data || {});

        const sugid = data?.data?.songs?.[0]?.id;
        if (sugid) {
          const suggestions = await getSuggestionSong(sugid);
          setSuggetion(suggestions?.data || []);
        } else {
          setSuggetion([]);
        }

        // build artists
        const albumData = data?.data || {};
        const songArtists =
          albumData.songs?.flatMap((s) => s.artists?.primary || []) || [];
        const topArtists = albumData.artists?.primary || [];
        const all = [...songArtists, ...topArtists];
        const unique = all.filter(
          (a, i, self) => a && a.id && i === self.findIndex((t) => t.id === a.id)
        );
        setAlbumArtists(unique);

        // similar albums
        try {
          const primaryArtistName =
            albumData.artists?.primary?.[0]?.name ||
            albumData.songs?.[0]?.artists?.primary?.[0]?.name ||
            null;
          const baseQuery =
            primaryArtistName ||
            albumData.name?.split("-")[0].trim() ||
            albumData.name;
          const similarRes = await searchAlbumByQuery(baseQuery);
          const allSim = similarRes?.data?.results || [];
          const filtered = allSim.filter((a) => a.id !== albumData.id).slice(0, 10);
          setSimilarAlbums(filtered);
        } catch (e) {
          console.error("similar albums fetch error", e);
        }
      } catch (err) {
        setError("Failed to fetch album details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  useEffect(() => {
    try {
      localStorage.setItem("likedAlbums", JSON.stringify(likedAlbums));
    } catch {}
  }, [likedAlbums]);

  const albumData = details?.data || {};
  const songs = albumData.songs || [];

  const albumImage =
    albumData.image?.[2]?.url ||
    albumData.image?.[1]?.url ||
    albumData.image?.[0]?.url ||
    "/default-image.png";

  const getSongImage = (song) =>
    song?.image?.[1]?.url ||
    song?.image?.[2]?.url ||
    song?.image?.[0]?.url ||
    albumImage;

  const playSingleSong = (song, queueOverride) => {
    const queue = queueOverride || songs;
    const audioSource = song.downloadUrl
      ? song.downloadUrl[4]?.url || song.downloadUrl[3]?.url || song.downloadUrl[0]?.url
      : song.audio;
    playMusic(
      audioSource,
      song.name,
      song.duration,
      song.image || getSongImage(song),
      song.id,
      song.artists,
      queue
    );
  };

  const playFirstSong = () => {
    if (!songs.length) return;
    playSingleSong(songs[0], songs);
  };

  const toggleLikeAlbum = () => {
    const albumId = albumData.id;
    if (!albumId) return;
    setLikedAlbums((prev) => {
      const exists = prev.some((p) => p.id === albumId);
      if (exists) return prev.filter((p) => p.id !== albumId);
      return [
        ...prev,
        { id: albumId, name: albumData.name, image: albumImage },
      ];
    });
  };

  const isAlbumPlaying = Boolean(currentSong && songs.some((s) => s.id === currentSong.id));

  // totals like playlist
  const totalSongs = songs.length;
  const totalSeconds = songs.reduce((sum, s) => sum + (s.duration || 0), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const totalDurationLabel = `${hours > 0 ? hours + " hr " : ""}${minutes} min`;

  if (loading) {
    return (
      <div className="flex h-screen w-screen justify-center items-center">
        <img src="/Loading.gif" alt="Loading..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen justify-center items-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <>
      <Navbar />

      {/* HERO / banner — same as PlaylistDetails */}
      <div
        className="relative w-full h-[22rem] lg:h-[28rem] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(2,6,23,0.8), rgba(2,6,23,0.9)), url(${albumImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(0.95)",
        }}
      >
        <div className="absolute inset-0 backdrop-blur-sm" />

        <div className="absolute left-0 right-0 bottom-0 px-[1.6rem] lg:px-[3rem] pb-6">
          <div className="flex items-end gap-6">
            <div className="transform translate-y-6">
              <div className="h-[9.5rem] w-[9.5rem] lg:h-[12rem] lg:w-[12rem] rounded-2xl overflow-hidden shadow-2xl border border-white/6">
                <img src={albumImage} alt={albumData.name || "Album"} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex-1 text-left translate-y-6">
              <h1 className="text-2xl lg:text-4xl font-extrabold text-white leading-tight">
                {albumData.name}
              </h1>
              <div className="mt-2 text-sm lg:text-base text-white/80">
                {totalSongs} song{totalSongs !== 1 ? "s" : ""} • {totalDurationLabel}
              </div>
              {albumData.description && (
                <div className="mt-2 text-sm text-white/70 line-clamp-2">
                  {albumData.description}
                </div>
              )}

              <div className="mt-4 flex items-center gap-4">
                {/* shuffle */}
                <button
                  onClick={() => toggleShuffle && toggleShuffle()}
                  className={`h-11 w-11 rounded-full flex items-center justify-center transition-all ${
                    shuffle ? "bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white" : "bg-white/6 text-white/80"
                  }`}
                  title="Shuffle"
                >
                  <PiShuffleBold className="text-xl" />
                </button>

                {/* main play/pause */}
                <button
                  onClick={() => {
                    if (isAlbumPlaying && isPlaying) {
                      playMusic(
                        currentSong?.audio?.currentSrc,
                        currentSong?.name,
                        currentSong?.duration,
                        currentSong?.image,
                        currentSong?.id,
                        songs
                      );
                    } else {
                      playFirstSong();
                    }
                  }}
                  className="h-16 w-16 rounded-full flex items-center justify-center bg-white text-black shadow-lg transform active:scale-95"
                  title={isAlbumPlaying && isPlaying ? "Pause" : "Play"}
                >
                  {isAlbumPlaying && isPlaying ? <FaPause className="text-2xl" /> : <FaPlay className="text-2xl" />}
                </button>

                {/* like */}
                <button
                  onClick={toggleLikeAlbum}
                  className="h-11 w-11 rounded-full flex items-center justify-center bg-white/6 text-white/80"
                  title="Like album"
                >
                  {likedAlbums.some((a) => a.id === albumData.id) ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* content below hero — negative margin to match playlist */}
      <div className="flex flex-col mt-2 px-[1.6rem] lg:px-[3rem] pb-32 -mt-12">
        {/* songs list – playlist style rows */}
        <div className="mt-4">
          {songs.length === 0 && <div className="text-sm opacity-70">Album is empty...</div>}

          {songs.map((song, idx) => {
            const artists = song.artists?.primary?.map((a) => a.name).join(", ") || "";
            const songImg = getSongImage(song);
            return (
              <button
                key={song.id || `${song.name}-${idx}`}
                className="flex items-center justify-between w-full px-2 py-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors text-left"
                onClick={() => playSingleSong(song)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img src={songImg} alt={song.name} className="h-12 w-12 rounded-md object-cover" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{song.name}</span>
                    <span className="text-[0.8rem] opacity-70 truncate">{artists}</span>
                  </div>
                </div>

                <span className="ml-3 text-[0.8rem] opacity-70">
                  {song.duration ? new Date(song.duration * 1000).toISOString().substring(14, 19) : ""}
                </span>
              </button>
            );
          })}
        </div>

        {/* You Might Like */}
        {Array.isArray(suggetions) && suggetions.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold mb-2">You Might Like</h2>
            <div className="w-full overflow-x-auto scroll-hide py-1">
              <div className="inline-flex gap-3 px-1">
                {suggetions.map((s, i) => (
                  <div key={s.id || i} className="inline-block">
                    <SongCardForRow {...s} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Similar Albums */}
        {similarAlbums.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold mb-2">Similar Albums</h2>
            <div className="px-1">
              <AlbumSlider albums={similarAlbums} cardSize="large" className="py-2" />
            </div>
          </div>
        )}

        {/* Artists */}
        {albumArtists.length > 0 && (
          <div className="mt-8 mb-6">
            <h2 className="text-sm font-semibold mb-2">Artists in this Album</h2>
            <ArtistSlider artists={albumArtists} />
          </div>
        )}
      </div>

      <Player />
      <Navigator />
      <Footer />
    </>
  );
};

const SongCardForRow = ({ id, name, image, artists }) => {
  const img = image?.[1]?.url || image?.[0]?.url;
  return (
    <div className="w-36 min-w-[9rem] rounded-lg overflow-hidden bg-white/6">
      <div className="h-36 w-36 overflow-hidden">
        <img src={img || "/default-image.png"} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="p-2">
        <div className="text-sm font-medium truncate">{name}</div>
        <div className="text-xs opacity-70 truncate">{artists?.primary?.map((a) => a.name).join(", ")}</div>
      </div>
    </div>
  );
};

export default AlbumDetail;
