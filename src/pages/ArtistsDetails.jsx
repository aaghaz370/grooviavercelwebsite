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

import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

const ArtistsDetails = () => {
  const { id } = useParams();
  const { playMusic } = useContext(MusicContext);

  const [artistData, setArtistData] = useState(null);
  const [topSongs, setTopSongs] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [singles, setSingles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // show 10, then +10 on each Show more
  const [visibleCount, setVisibleCount] = useState(10);

  const singlesScrollRef = useRef(null);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        setLoading(true);
        const data = await fetchArtistByID(id);
        const raw = data?.data;
        const artist = Array.isArray(raw) ? raw[0] : raw;

        setArtistData(artist || null);

        // prefer full arrays if provided by API
        setTopSongs(artist?.topSongs || []);
        setTopAlbums(artist?.topAlbums?.albums || artist?.topAlbums || []);
        setSingles(artist?.singles || []);
      } catch (err) {
        console.error("fetchArtist error:", err);
        setError("Error fetching artist details");
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [id]);

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

      playMusic(
        audioSource,
        firstSong.name,
        firstSong.duration,
        firstSong.image,
        firstSong.id,
        firstSong.artists,
        albumData.songs
      );
    } catch (e) {
      console.error("Error playing single", e);
    }
  };

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

  const visibleTopSongs = topSongs.slice(0, visibleCount);
  const hasMoreTopSongs = topSongs.length > visibleCount;

  return (
    <>
      <Navbar />

      {/* HERO like PlaylistDetails */}
      <div
        className="relative w-full h-[22rem] lg:h-[28rem] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(2,6,23,0.85), rgba(2,6,23,0.95)), url(${imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(0.95)",
        }}
      >
        <div className="absolute inset-0 backdrop-blur-sm" />

        <div className="absolute left-0 right-0 bottom-0 px-[1.6rem] lg:px-[3rem] pb-6">
          <div className="flex items-end gap-6">
            {/* Square cover with white border like playlist */}
            <div className="transform translate-y-6">
              <div className="h-[9.5rem] w-[9.5rem] lg:h-[12rem] lg:w-[12rem] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/5">
                <img
                  src={imageUrl}
                  alt={artistData.name || "Artist"}
                  className="w-full h-full object-cover opacity-95"
                />
              </div>
            </div>

            <div className="flex-1 text-left translate-y-6">
              <h1 className="text-2xl lg:text-4xl font-extrabold text-white leading-tight">
                {artistData.name}
              </h1>

              <div className="mt-2 text-sm lg:text-base text-white/80">
                {/* use followers if available */}
                Followers : {artistData.followerCount || artistData.fans || "—"}
              </div>

              <div className="mt-4 flex items-center gap-4">
                {/* no big play for artist by default; keep minimal icons if you want */}
                <button
                  onClick={() => {
                    // optional: play first top song
                    if (visibleTopSongs.length > 0) {
                      const s = visibleTopSongs[0];
                      const audioSource = s.downloadUrl
                        ? s.downloadUrl[4]?.url || s.downloadUrl
                        : s.audio;
                      playMusic(
                        audioSource,
                        s.name,
                        s.duration,
                        s.image,
                        s.id,
                        s.artists,
                        topSongs
                      );
                    }
                  }}
                  className="h-14 w-14 rounded-full flex items-center justify-center bg-white text-black shadow-lg transform active:scale-95"
                >
                  ▶
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* page content below hero */}
      <div className="flex flex-col mt-2 px-[1.6rem] lg:px-[3rem] pb-32 -mt-12">
        {/* Top Songs — playlist-like rows */}
        <div className="mt-4">
          {topSongs.length === 0 && <div className="text-sm opacity-70">No songs available...</div>}

          {visibleTopSongs.map((song, idx) => (
            <SongsList key={song.id || `${song.name}-${idx}`} {...song} song={topSongs} />
          ))}

          {hasMoreTopSongs && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setVisibleCount((c) => c + 10)}
                className="px-4 py-2 rounded-full bg-white/6 border border-white/10"
              >
                Show more
              </button>
            </div>
          )}
        </div>

        {/* Top Albums */}
        {topAlbums.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold mb-2">Top Albums</h2>
            <AlbumSlider albums={topAlbums} />
          </div>
        )}

        {/* Singles */}
        {singles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold mb-2">Singles</h2>

            <div className="flex justify-center items-center gap-2 w-full">
              <MdOutlineKeyboardArrowLeft
                className="text-3xl hidden lg:block cursor-pointer"
                onClick={() => { if (singlesScrollRef.current) singlesScrollRef.current.scrollLeft -= 800; }}
              />

              <div
                ref={singlesScrollRef}
                className="grid grid-rows-1 grid-flow-col gap-3 w-full overflow-x-auto scroll-smooth scroll-hide px-1 lg:px-0"
              >
                {singles.map((single) => (
                  <div key={single.id} onClick={() => handleSingleClick(single)} className="cursor-pointer">
                    <SongGrid {...single} song={singles} />
                  </div>
                ))}
              </div>

              <MdOutlineKeyboardArrowRight
                className="text-3xl hidden lg:block cursor-pointer"
                onClick={() => { if (singlesScrollRef.current) singlesScrollRef.current.scrollLeft += 800; }}
              />
            </div>
          </div>
        )}
      </div>

      <Player />
      <Navigator />
      <Footer />
    </>
  );
};

export default ArtistsDetails;
