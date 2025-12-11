// src/pages/ArtistsDetails.jsx
import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Player from "../components/Player";
import Navigator from "../components/Navigator";
import Footer from "../components/footer";
import SongsList from "../components/SongsList";
import AlbumSlider from "../components/Sliders/AlbumSlider";
import SongGrid from "../components/SongGrid";
import { fetchArtistByID, fetchAlbumByID } from "../../fetch";
import MusicContext from "../context/MusicContext";
import he from "he";

import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { FaPlay } from "react-icons/fa";
import { PiShuffleBold } from "react-icons/pi";

const ArtistsDetails = () => {
  const { id } = useParams();
  const { playMusic } = useContext(MusicContext);

  const [artistData, setArtistData] = useState(null);
  const [topSongs, setTopSongs] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [singles, setSingles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const singlesScrollRef = useRef(null);

  const scrollLeft = () => {
    if (singlesScrollRef.current) {
      singlesScrollRef.current.scrollLeft -= 800;
    }
  };

  const scrollRight = () => {
    if (singlesScrollRef.current) {
      singlesScrollRef.current.scrollLeft += 800;
    }
  };

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        setLoading(true);
        const data = await fetchArtistByID(id);

        const raw = data?.data;
        const artist = Array.isArray(raw) ? raw[0] : raw;

        setArtistData(artist || null);

        const ts = artist?.topSongs || [];
        setTopSongs(ts);

        const ta = artist?.topAlbums?.albums || artist?.topAlbums || [];
        setTopAlbums(ta);

        const sg = artist?.singles || [];
        setSingles(sg);
      } catch (err) {
        console.error(err);
        setError("Error fetching artist details");
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen justify-center items-center">
        <img src="/Loading.gif" alt="Loading..." />
      </div>
    );
  }

  if (error || !artistData) {
    return (
      <div className="flex h-screen w-screen justify-center items-center">
        {error || "Artist not found"}
      </div>
    );
  }

  const imageUrl =
    artistData.image?.[2]?.url || artistData.image?.[0]?.url || "/Unknown.png";

  // sanitize titles - remove From "..." wrapper while preserving the movie name
  const sanitizeTitle = (raw) => {
    if (!raw) return "";
    // decode HTML entities first
    let decoded = he.decode(raw);

    // patterns to convert:
    // "Song Title (From "Jawan")" -> "Song Title (Jawan)"
    decoded = decoded.replace(
      /\(From\s*["'“”](.*?)["'“”]\)/i,
      "($1)"
    );

    // If still has outside "From " without parentheses e.g. 'Song Title From "Jawan"' -> 'Song Title (Jawan)'
    decoded = decoded.replace(
      /From\s*["'“”](.*?)["'“”]/i,
      "($1)"
    );

    // fallback: remove stray From &quot; tokens
    decoded = decoded.replace(/From\s*&quot;?/gi, "");
    decoded = decoded.replace(/&quot;/gi, "");

    return decoded.trim();
  };

  // 👉 Single card tap -> fetch album -> play first song
  const handleSingleClick = async (single) => {
    try {
      const albumId = single.id;
      if (!albumId) return;

      const albumRes = await fetchAlbumByID(albumId);
      const albumData = albumRes?.data;
      const firstSong = albumData?.songs?.[0];

      if (!firstSong) return;

      const audioSource = firstSong.downloadUrl
        ? firstSong.downloadUrl[4]?.url || firstSong.downloadUrl
        : firstSong.audio;

      const { name, duration, image, id, artists } = firstSong;

      playMusic(
        audioSource,
        name,
        duration,
        image,
        id,
        artists,
        albumData.songs
      );
    } catch (e) {
      console.error("Error playing single", e);
    }
  };

  // play helper for SongsList rows (we pass sanitized name into SongsList)
  const playFromRow = (song, queue) => {
    if (!song) return;
    const q = queue || topSongs;
    const audioSource = song.downloadUrl
      ? song.downloadUrl[4]?.url || song.downloadUrl
      : song.audio;
    const { name, duration, image, id, artists } = song;
    playMusic(audioSource, name, duration, image, id, artists, q);
  };

  return (
    <>
      <Navbar />

      <main className="pt-[9rem] lg:pt-[6.5rem] pb-[6rem] lg:pb-[4.5rem] px-4 lg:px-16 flex flex-col gap-8">
        {/* HERO */}
        <section className="flex flex-col lg:flex-row items-center lg:items-end gap-6">
          {/* BIG SQUARE ARTIST IMAGE (YT-like) */}
          <div className="w-36 h-36 lg:w-48 lg:h-48 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-black/40 to-white/5">
            <img
              src={imageUrl}
              alt={artistData.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-2 lg:ml-4 w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-semibold">
                {artistData.name}
              </h1>
              {artistData?.isVerified && (
                <img
                  src="/verified.svg"
                  alt="Verified"
                  className="w-5 h-5 lg:w-6 lg:h-6"
                />
              )}
            </div>
            <p className="text-sm lg:text-base text-gray-300">
              Followers : {artistData.followerCount || artistData.fans || "—"}
            </p>
            {artistData?.listenerCount && (
              <p className="text-sm lg:text-base text-gray-300">
                Listeners : {artistData.listenerCount}
              </p>
            )}
          </div>

          {/* RIGHT: play / shuffle / like minimal circular icons */}
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => {
                if (topSongs && topSongs.length) playFromRow(topSongs[0], topSongs);
              }}
              className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center shadow-md hover:scale-105 transition"
              title="Play"
            >
              <FaPlay />
            </button>

            <button
              onClick={() => {
                if (!topSongs || !topSongs.length) return;
                const arr = [...topSongs];
                for (let i = arr.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                playFromRow(arr[0], arr);
              }}
              className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-sm hover:bg-white/10 transition"
              title="Shuffle"
            >
              <PiShuffleBold />
            </button>

            {/* keep like button as before (you had heart elsewhere) - keep small circle */}
            <button
              className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-sm hover:bg-white/10 transition"
              title="Like"
            >
              {/* We don't toggle here to keep logic same as before (you can wire it if needed) */}
              <img src="/like-icon.svg" alt="like" className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* TOP SONGS */}
        {topSongs.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xl lg:text-2xl font-semibold">Top Songs</h2>
            <div className="flex flex-col gap-2">
              {topSongs.map((song) => {
                // pass sanitized title to SongsList so the component shows cleaned title
                const cleanName = sanitizeTitle(song.name || song.title);
                return (
                  <div key={song.id || cleanName}>
                    <SongsList
                      {...song}
                      name={cleanName}
                      song={topSongs}
                      onPlay={() => playFromRow(song, topSongs)}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TOP ALBUMS */}
        {topAlbums.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xl lg:text-2xl font-semibold">Top Albums</h2>
            <AlbumSlider albums={topAlbums} />
          </section>
        )}

        {/* SINGLES – SAME CARD STYLE, AB TAP PE PLAY HOGA */}
        {singles.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xl lg:text-2xl font-semibold">Singles</h2>

            <div className="flex justify-center items-center gap-2 w-full">
              <MdOutlineKeyboardArrowLeft
                className="text-3xl h-[9rem] hidden lg:block arrow-btn hover:scale-125 cursor-pointer"
                onClick={scrollLeft}
              />

              <div
                ref={singlesScrollRef}
                className="grid grid-rows-1 grid-flow-col gap-3 lg:gap-3 w-full overflow-x-auto scroll-smooth scroll-hide px-1 lg:px-0"
              >
                {singles.map((single) => (
                  <div
                    key={single.id}
                    onClick={() => handleSingleClick(single)}
                    className="cursor-pointer"
                  >
                    <SongGrid
                      {...single}
                      song={singles}
                      downloadUrl={
                        single.downloadUrl ||
                        single.songs?.[0]?.downloadUrl ||
                        single.perma_url
                      }
                      image={single.image || single.songs?.[0]?.image}
                      artists={single.artists || single.songs?.[0]?.artists}
                      duration={single.duration || single.songs?.[0]?.duration}
                      name={sanitizeTitle(single.name || single.title)}
                    />
                  </div>
                ))}
              </div>

              <MdOutlineKeyboardArrowRight
                className="text-3xl h-[9rem] hidden lg:block arrow-btn hover:scale-125 cursor-pointer"
                onClick={scrollRight}
              />
            </div>
          </section>
        )}
      </main>

      <Footer />
      <Navigator />
      <Player />
    </>
  );
};

export default ArtistsDetails;
