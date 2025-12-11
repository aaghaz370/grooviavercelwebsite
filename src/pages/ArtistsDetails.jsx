// src/pages/ArtistsDetails.jsx
import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Player from "../components/Player";
import Navigator from "../components/Navigator";
import Footer from "../components/footer";
import AlbumSlider from "../components/Sliders/AlbumSlider";
import SongGrid from "../components/SongGrid";
import { fetchArtistByID, fetchAlbumByID, getSongbyQuery } from "../../fetch";
import MusicContext from "../context/MusicContext";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";

/** Small helper to remove HTML entities / noisy tokens.
 *  Use `he.decode` if you add `he` dependency; fallback to simple replaces below.
 */
const sanitizeTitle = (raw = "") => {
  if (!raw) return "";
  let s = raw;
  // common HTML entities
  s = s.replace(/&quot;/g, '"');
  s = s.replace(/&amp;/g, "&");
  s = s.replace(/&lt;/g, "<");
  s = s.replace(/&gt;/g, ">");
  // remove (From "X") noisy tokens like the playlist code
  s = s.replace(/\(From\s*["'“”](.*?)["'“”]\)/gi, "($1)");
  s = s.replace(/From\s*["'“”](.*?)["'“”]/gi, "($1)");
  s = s.replace(/&quot;/gi, '"');
  return s.trim();
};

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

        const receivedTopSongs = artist?.topSongs || [];
        setTopSongs(receivedTopSongs);

        setTopAlbums(artist?.topAlbums?.albums || artist?.topAlbums || []);
        setSingles(artist?.singles || []);

        console.log("artist topSongs length (initial):", receivedTopSongs.length);

        // If API returned only a few songs (<= visibleCount) attempt fallback search by artist name
        if ((receivedTopSongs.length || 0) <= visibleCount) {
          try {
            const artistName = artist?.name || "";
            if (artistName) {
              // Use your existing search endpoint to try and get more songs for this artist
              const searchRes = await getSongbyQuery(encodeURIComponent(artistName), 100);
              const results = searchRes?.data?.results || searchRes?.results || [];

              // Merge unique by id, prefer original topSongs order first
              const existingIds = new Set(receivedTopSongs.map((s) => s?.id));
              const extra = results.filter((r) => r && r.id && !existingIds.has(r.id));
              if (extra.length) {
                const merged = [...receivedTopSongs, ...extra];
                setTopSongs(merged);
                console.log("Fetched extra songs from search:", extra.length, "total now:", merged.length);
              } else {
                console.log("No extra songs found via search fallback.");
              }
            }
          } catch (fallbackErr) {
            console.warn("fallback search for artist songs failed:", fallbackErr);
          }
        }
      } catch (err) {
        console.error("fetchArtist error:", err);
        setError("Error fetching artist details");
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [id]); // eslint-disable-line

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

  // helper to pick image like playlist
  const getSongImage = (song) =>
    song?.image?.[1]?.url || song?.image?.[2]?.url || song?.image?.[0]?.url || imageUrl;

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
            <div className="transform translate-y-6">
              <div className="h-[9.5rem] w-[9.5rem] lg:h-[12rem] lg:w-[12rem] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/5">
                <img src={imageUrl} alt={artistData.name || "Artist"} className="w-full h-full object-cover opacity-95" />
              </div>
            </div>

            <div className="flex-1 text-left translate-y-6">
              <h1 className="text-2xl lg:text-4xl font-extrabold text-white leading-tight">
                {artistData.name}
              </h1>

              <div className="mt-2 text-sm lg:text-base text-white/80">
                Followers : {artistData.followerCount || artistData.fans || "—"}
              </div>

              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={() => {
                    if (visibleTopSongs.length > 0) {
                      const s = visibleTopSongs[0];
                      const audioSource = s.downloadUrl ? s.downloadUrl[4]?.url || s.downloadUrl : s.audio;
                      playMusic(audioSource, s.name, s.duration, s.image || getSongImage(s), s.id, s.artists, topSongs);
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
        {/* Top Songs — use exact playlist row markup so spacing matches */}
        <div className="mt-4">
          {topSongs.length === 0 && <div className="text-sm opacity-70">No songs available...</div>}

          {visibleTopSongs.map((song, idx) => {
            const artists = song?.artists?.primary?.map((a) => a?.name).join(", ") || "";
            const songImg = getSongImage(song);
            const displayName = sanitizeTitle(song?.name || song?.title || "");
            return (
              <button
                key={song.id || `${song.name}-${idx}`}
                className="flex items-center justify-between w-full px-2 py-3 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors text-left"
                onClick={() => {
                  const audioSource = song?.downloadUrl
                    ? song.downloadUrl[4]?.url || song.downloadUrl[3]?.url || song.downloadUrl[0]?.url
                    : song?.audio;
                  playMusic(audioSource, song?.name, song?.duration, song?.image || songImg, song?.id, song?.artists, topSongs);
                }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img src={songImg} alt={song?.name} className="h-12 w-12 rounded-md object-cover" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{displayName}</span>
                    <span className="text-[0.8rem] opacity-70 truncate">{artists}</span>
                  </div>
                </div>

                <span className="ml-3 text-[0.8rem] opacity-70">
                  {song?.duration ? new Date((song.duration || 0) * 1000).toISOString().substring(14, 19) : ""}
                </span>
              </button>
            );
          })}

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
