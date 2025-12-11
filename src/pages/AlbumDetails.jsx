// src/pages/AlbumDetail.jsx
import { useEffect, useState, useRef, useContext, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import SongsList from "../components/SongsList";
import Player from "../components/Player";
import {
  fetchAlbumByID,
  getSuggestionSong,
  searchAlbumByQuery,
} from "../../fetch";
import Footer from "../components/footer";
import Navigator from "../components/Navigator";
import { FaHeart, FaRegHeart, FaPlay, FaPause } from "react-icons/fa";
import SongGrid from "../components/SongGrid";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { IoShareSocial } from "react-icons/io5";
import AlbumSlider from "../components/Sliders/AlbumSlider";
import ArtistSlider from "../components/Sliders/ArtistSlider";
import { PiShuffleBold } from "react-icons/pi";
import MusicContext from "../context/MusicContext";

const AlbumDetail = () => {
  const { id } = useParams();
  const { playMusic, currentSong, isPlaying, shuffle, toggleShuffle } =
    useContext(MusicContext);

  // initialize details as empty object to avoid undefined errors
  const [details, setDetails] = useState({});
  const [suggetions, setSuggetion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState({});
  const [error, setError] = useState(null);

  const [likedAlbums, setLikedAlbums] = useState(() => {
    return JSON.parse(localStorage.getItem("likedAlbums")) || [];
  });

  const [similarAlbums, setSimilarAlbums] = useState([]);
  const [albumArtists, setAlbumArtists] = useState([]);

  const scrollRef = useRef(null);

  const scrollLeft = (ref) => {
    if (ref.current) ref.current.scrollLeft -= 1000;
  };
  const scrollRight = (ref) => {
    if (ref.current) ref.current.scrollLeft += 1000;
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchAlbumByID(id);
        setDetails(data || {});

        const sugid = data?.data?.songs?.[0]?.id;
        if (sugid) {
          const suggestions = await getSuggestionSong(sugid);
          setSuggetion(suggestions.data || []);
        } else {
          setSuggetion([]);
        }

        const albumSongs = data?.data?.songs || [];
        setList(albumSongs);
      } catch (err) {
        setError("Error fetching album details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // like/unlike
  const toggleLikeAlbum = () => {
    let storedLiked = JSON.parse(localStorage.getItem("likedAlbums")) || [];

    const albumId = details?.data?.id;
    if (!albumId) return;

    if (storedLiked.some((album) => album.id === albumId)) {
      storedLiked = storedLiked.filter((album) => album.id !== albumId);
    } else {
      storedLiked.push({
        id: albumId,
        name: details.data?.name,
        image: details.data?.image?.[2]?.url,
        artists: details.data?.artists,
      });
    }

    setLikedAlbums(storedLiked);
    localStorage.setItem("likedAlbums", JSON.stringify(storedLiked));
  };

  // artists
  useEffect(() => {
    const albumData = details?.data;
    if (!albumData) return;
    const songArtists =
      albumData.songs?.flatMap((s) => s.artists?.primary || []) || [];
    const topArtists = albumData.artists?.primary || [];
    const all = [...songArtists, ...topArtists];
    const unique = all.filter(
      (a, i, self) => a && a.id && i === self.findIndex((t) => t.id === a.id)
    );
    setAlbumArtists(unique);
  }, [details]);

  // similar albums
  useEffect(() => {
    const albumData = details?.data;
    if (!albumData) return;
    const fetchSimilar = async () => {
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
        const all = similarRes?.data?.results || [];
        const filtered = all.filter((a) => a.id !== albumData.id).slice(0, 10);
        setSimilarAlbums(filtered);
      } catch (e) {
        console.error("similar albums fetch error", e);
      }
    };
    fetchSimilar();
  }, [details]);

  if (loading)
    return (
      <div className="flex h-screen w-screen justify-center items-center ">
        <img src="/Loading.gif" alt="" />
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen w-screen justify-center items-center">
        {error}
      </div>
    );

  // safe access with optional chaining
  const albumdata = details?.data || {};
  const songs = details?.data?.songs || [];

  const albumImage =
    details?.data?.image?.[2]?.url ||
    details?.data?.image?.[1]?.url ||
    details?.data?.image?.[0]?.url ||
    "/default-image.png";

  // helper fallback image for song
  const getSongImage = (song) =>
    song?.image?.[2]?.url ||
    song?.image?.[1]?.url ||
    song?.image?.[0]?.url ||
    albumImage;

  // play first song – keep existing behavior
  const playFirstSong = () => {
    if (!songs || songs.length === 0) return;
    const firstSong = songs[0];
    const audioSource = firstSong.downloadUrl
      ? firstSong.downloadUrl[4]?.url ||
        firstSong.downloadUrl[0]?.url ||
        firstSong.downloadUrl
      : firstSong.audio;

    playMusic(
      audioSource,
      firstSong.name,
      firstSong.duration,
      firstSong.image || getSongImage(firstSong),
      firstSong.id,
      firstSong.artists,
      songs
    );
  };

  const isAlbumPlaying = Boolean(
    currentSong && songs.some((s) => s.id === currentSong.id)
  );

  // compute totals like playlist page
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

  return (
    <>
      <Navbar />

      <div className="flex flex-col mt-[7.5rem] lg:mt-[5.5rem] px-[1.6rem] lg:px-[3rem] pb-32">
        {/* Header — same style as PlaylistDetails */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="h-[7rem] w-[7rem] lg:h-[8rem] lg:w-[8rem] rounded-2xl overflow-hidden bg-white/5 shadow-xl shadow-black/40 DetailImg">
              <img
                src={albumImage}
                alt={albumdata.name || "Album"}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[0.7rem] uppercase tracking-[0.16em] opacity-70">
                {albumdata.type || "Album"}
              </span>
              <h1 className="text-[1.6rem] lg:text-[1.9rem] font-semibold leading-tight">
                {albumdata.name}
              </h1>
              <span className="text-[0.8rem] opacity-70">
                {totalSongs} song{totalSongs !== 1 ? "s" : ""} • {totalDurationLabel}
              </span>
              {albumdata.description && (
                <span className="text-[0.75rem] opacity-60 line-clamp-2">
                  {albumdata.description}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2">
              {songs.length > 0 && (
                <>
                  {/* small shuffle icon (no label) */}
                  <button
                    onClick={() => toggleShuffle && toggleShuffle()}
                    className={`h-[2.6rem] w-[2.6rem] rounded-full flex items-center justify-center ${
                      shuffle ? "bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white" : "bg-white/6 text-white/80"
                    }`}
                    title="Shuffle"
                  >
                    <PiShuffleBold className="text-sm" />
                  </button>

                  {/* main big circular play/pause */}
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
                    className={`ml-2 h-12 w-12 rounded-full flex items-center justify-center shadow-md transition transform active:scale-95 ${
                      isAlbumPlaying && isPlaying ? "bg-white text-black" : "bg-white/90 text-black"
                    }`}
                    title={isAlbumPlaying && isPlaying ? "Pause" : "Play"}
                  >
                    {isAlbumPlaying && isPlaying ? <FaPause /> : <FaPlay />}
                  </button>
                </>
              )}

              {/* like */}
              <button
                onClick={toggleLikeAlbum}
                title="Like Album"
                className="flex items-center justify-center h-[2.6rem] w-[2.6rem] rounded-full border border-white/20 bg-white/5 hover:bg-white/10 ml-3"
              >
                {likedAlbums.some((a) => a.id === albumdata.id) ? (
                  <FaHeart className="text-red-500 text-lg" />
                ) : (
                  <FaRegHeart className="text-lg" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Songs list — full width, same row style as PlaylistDetails */}
        <div className="mt-2 flex flex-col">
          {songs.length === 0 && (
            <div className="text-xs opacity-70">Album is empty...</div>
          )}

          {songs.map((song, idx) => {
            const artists =
              song.artists?.primary?.map((a) => a.name).join(", ") || "";
            const songImg = getSongImage(song);

            return (
              <button
                key={song.id || `${song.name}-${idx}`}
                className="flex items-center justify-between w-full px-1 py-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left"
                onClick={() =>
                  playMusic(
                    song.downloadUrl
                      ? song.downloadUrl[4]?.url ||
                        song.downloadUrl[3]?.url ||
                        song.downloadUrl[0]?.url
                      : song.audio,
                    song.name,
                    song.duration,
                    song.image || songImg,
                    song.id,
                    song.artists,
                    songs
                  )
                }
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={songImg}
                    alt={song.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">
                      {song.name}
                    </span>
                    <span className="text-[0.75rem] opacity-70 truncate">
                      {artists}
                    </span>
                  </div>
                </div>

                <span className="ml-3 text-[0.75rem] opacity-70">
                  {song.duration
                    ? new Date(song.duration * 1000)
                        .toISOString()
                        .substring(14, 19)
                    : ""}
                </span>
              </button>
            );
          })}
        </div>

        {/* You Might Like */}
        {Array.isArray(suggetions) && suggetions.length > 0 && (
          <div className="flex flex-col justify-center items-center w-full mb-[1.5rem]">
            <h2 className="m-0 mt-2 text-xl sm:text-2xl font-semibold w-full">
              You Might Like
            </h2>
            <div className="flex justify-center items-center gap-3 w-full mt-3">
              <MdOutlineKeyboardArrowLeft
                className="text-3xl hover:scale-125 transition-all duration-200 ease-in-out cursor-pointer hidden lg:block"
                onClick={() => scrollLeft(scrollRef)}
              />
              <div
                className="grid grid-rows-1 grid-flow-col justify-start overflow-x-scroll scroll-hide items-center gap-3 w-full px-1 scroll-smooth"
                ref={scrollRef}
              >
                {suggetions.map((song, index) => (
                  <SongGrid key={song.id || index} {...song} song={list} />
                ))}
              </div>
              <MdOutlineKeyboardArrowRight
                className="text-3xl hover:scale-125 transition-all duration-200 ease-in-out cursor-pointer hidden lg:block"
                onClick={() => scrollRight(scrollRef)}
              />
            </div>
          </div>
        )}

        {/* Similar Albums */}
        {similarAlbums.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">Similar Albums</h2>
            <AlbumSlider albums={similarAlbums} />
          </div>
        )}

        {/* Artists — tightened gap */}
        {albumArtists.length > 0 && (
          <div className="mt-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">Artists in this Album</h2>
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

export default AlbumDetail;
