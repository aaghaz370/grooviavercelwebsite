// src/pages/AlbumDetail.jsx
import { useEffect, useState, useRef, useContext } from "react";
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
  const { id } = useParams(); // album id from URL
  const { playMusic, currentSong, isPlaying, shuffle, toggleShuffle } =
    useContext(MusicContext);

  const [details, setDetails] = useState(null);
  const [suggetions, setSuggetion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState({});
  const [error, setError] = useState(null);

  const [likedAlbums, setLikedAlbums] = useState(() => {
    return JSON.parse(localStorage.getItem("likedAlbums")) || [];
  });

  // NEW: extra sections
  const [similarAlbums, setSimilarAlbums] = useState([]);
  const [albumArtists, setAlbumArtists] = useState([]);

  const scrollRef = useRef(null);

  const scrollLeft = (scrollRef) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= 1000;
    }
  };

  const scrollRight = (scrollRef) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 1000;
    }
  };

  // ------------ MAIN ALBUM + SUGGESTION FETCH ------------
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchAlbumByID(id);
        setDetails(data);

        const sugid = data?.data?.songs?.[0]?.id;
        if (sugid) {
          const suggestions = await getSuggestionSong(sugid);
          setSuggetion(suggestions.data || []);
        } else {
          setSuggetion([]);
        }

        const albumSongs = data.data.songs || [];
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

  // ------------ LIKE / UNLIKE ALBUM ------------
  const toggleLikeAlbum = () => {
    let storedLiked = JSON.parse(localStorage.getItem("likedAlbums")) || [];

    if (storedLiked.some((album) => album.id === details.data.id)) {
      storedLiked = storedLiked.filter((album) => album.id !== details.data.id);
    } else {
      storedLiked.push({
        id: details.data.id,
        name: details.data.name,
        image: details.data.image?.[2]?.url,
        artists: details.data.artists,
      });
    }

    setLikedAlbums(storedLiked);
    localStorage.setItem("likedAlbums", JSON.stringify(storedLiked));
  };

  // ------------ ARTISTS IN THIS ALBUM ------------
  useEffect(() => {
    const albumData = details?.data;
    if (!albumData) return;

    const songArtists =
      albumData.songs?.flatMap((s) => s.artists?.primary || []) || [];

    const topArtists = albumData.artists?.primary || [];

    const all = [...songArtists, ...topArtists];

    const unique = all.filter(
      (a, i, self) => a.id && i === self.findIndex((t) => t.id === a.id)
    );

    setAlbumArtists(unique);
  }, [details]);

  // ------------ SIMILAR ALBUMS ------------
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

        const filtered = all
          .filter((a) => a.id !== albumData.id)
          .slice(0, 10);

        setSimilarAlbums(filtered);
      } catch (e) {
        console.error("similar albums fetch error", e);
      }
    };

    fetchSimilar();
  }, [details]);

  // ------------ LOADING / ERROR ------------
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

  const albumdata = details.data || {};
  const primaryArtist = details.data?.artists?.primary?.[0] || {};
  const artistId = primaryArtist.id;
  const artistName = primaryArtist.name;

  // safe album image
  const albumImage =
    details?.data?.image?.[2]?.url ||
    details?.data?.image?.[1]?.url ||
    details?.data?.image?.[0]?.url ||
    "/default-image.png";

  const songs = details.data?.songs || [];

  // helper: get song image fallback to album
  const getSongImage = (song) =>
    song.image?.[2]?.url || song.image?.[1]?.url || song.image?.[0]?.url || albumImage;

  // play first song helper (keeps your functions unchanged)
  const playFirstSong = () => {
    if (!songs || songs.length === 0) return;
    const firstSong = songs[0];
    const audioSource = firstSong.downloadUrl
      ? firstSong.downloadUrl[4]?.url || firstSong.downloadUrl[0]?.url || firstSong.downloadUrl
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

  // detect album playing
  const isAlbumPlaying = Boolean(
    currentSong && songs.some((s) => s.id === currentSong.id)
  );

  return (
    <>
      <Navbar />

      {/* HERO / banner — tuned spacing so it doesn't overlap content */}
      <div
        className="relative w-full h-[18rem] lg:h-[22rem] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(2,6,23,0.85), rgba(2,6,23,0.95)), url(${albumImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 backdrop-blur-sm" />

        <div className="absolute left-4 right-4 bottom-4 lg:left-12 lg:right-12 pb-2">
          <div className="flex items-end gap-4 lg:gap-6">
            <div className="transform translate-y-4">
              <div className="h-[8.5rem] w-[8.5rem] lg:h-[11.5rem] lg:w-[11.5rem] rounded-2xl overflow-hidden shadow-2xl border border-white/6">
                <img
                  src={albumImage}
                  alt={details.data.name || "Album"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 text-left translate-y-4">
              <h1 className="text-xl lg:text-3xl font-extrabold text-white leading-tight">
                {details.data.name}
              </h1>
              <div className="mt-1 text-sm lg:text-base text-white/80">
                {details.data.songCount} song{details.data.songCount !== 1 ? "s" : ""} •{" "}
                {Math.floor((songs.reduce((a,b) => a + (b.duration||0),0))/3600)} hr{" "}
                {Math.floor(((songs.reduce((a,b) => a + (b.duration||0),0))%3600)/60)} min
              </div>

              {details.data.description && (
                <div className="mt-2 text-sm text-white/70 line-clamp-2">
                  {details.data.description}
                </div>
              )}

              {/* controls row */}
              <div className="mt-3 flex items-center gap-3">
                {/* shuffle (small) */}
                <button
                  onClick={() => toggleShuffle && toggleShuffle()}
                  className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                    shuffle ? "bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] text-white" : "bg-white/6 text-white/80"
                  }`}
                  title="Shuffle"
                >
                  <PiShuffleBold className="text-lg" />
                </button>

                {/* main big play/pause */}
                <button
                  onClick={() => {
                    if (isAlbumPlaying && isPlaying) {
                      // pause by calling playMusic on current (matches existing pattern)
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
                  className="h-14 w-14 rounded-full flex items-center justify-center bg-white text-black shadow-md transform active:scale-95"
                  title={isAlbumPlaying && isPlaying ? "Pause" : "Play"}
                >
                  {isAlbumPlaying && isPlaying ? <FaPause className="text-2xl" /> : <FaPlay className="text-2xl" />}
                </button>

                {/* like (small) */}
                <button
                  onClick={toggleLikeAlbum}
                  className="h-10 w-10 rounded-full flex items-center justify-center bg-white/6 text-white/80"
                  title="Like album"
                >
                  {likedAlbums.some((a) => a.id === albumdata.id) ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE CONTENT — pull up slightly but not overlapped; smaller negative margin */}
      <div className="flex flex-col gap-6 px-4 lg:px-12 -mt-8 pb-32">
        {/* Songs list — full width like before */}
        <div className="flex flex-col h-auto gap-4 mt-2">
          <div className="flex flex-col gap-3">
            {songs.map((song) => (
              <SongsList key={song.id} {...song} song={list} />
            ))}
          </div>
        </div>

        {/* You Might Like */}
        {Array.isArray(suggetions) && suggetions.length > 0 && (
          <div className="flex flex-col justify-center items-center w-full mb-2">
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
          <div className="w-full mb-4">
            <h2 className="mt-2 text-xl lg:text-2xl font-semibold">
              Similar Albums
            </h2>
            <AlbumSlider albums={similarAlbums} />
          </div>
        )}

        {/* Artists in this Album — reduce extra top/bottom gap */}
        {albumArtists.length > 0 && (
          <div className="w-full mb-6">
            <h2 className="text-xl lg:text-2xl font-semibold mb-4">
              Artists in this Album
            </h2>
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
