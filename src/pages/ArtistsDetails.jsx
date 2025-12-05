import { useEffect, useState, useRef, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Player from "../components/Player";
import Navigator from "../components/Navigator";
import Footer from "../components/footer";
import SongsList from "../components/SongsList";
import AlbumSlider from "../components/Sliders/AlbumSlider";
import SongGrid from "../components/SongGrid";
import { fetchArtistByID } from "../../fetch";
import MusicContext from "../context/MusicContext";
import he from "he";

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

        // API se jo bhi shape aaye, usko normalise kar rahe hain
        const raw = data?.data;
        const artist = Array.isArray(raw) ? raw[0] : raw;

        setArtistData(artist || null);

        // Top songs
        const ts = artist?.topSongs || [];
        setTopSongs(ts);

        // Top albums
        const ta =
          artist?.topAlbums?.albums || // agar nested ho
          artist?.topAlbums ||
          [];
        setTopAlbums(ta);

        // Singles (songs style cards)
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

  return (
    <>
      <Navbar />

      {/* Pure page scrollable, andar ka koi section alag se scroll nahi karega */}
      <main className="pt-[9rem] lg:pt-[6.5rem] pb-[6rem] lg:pb-[4.5rem] px-4 lg:px-16 flex flex-col gap-8">

        {/* HERO SECTION */}
        <section className="flex flex-col lg:flex-row items-center lg:items-end gap-6">
          <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden shadow-xl">
            <img
              src={imageUrl}
              alt={artistData.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-2 lg:ml-4 w-full">
            <div className="flex items-center gap-2">
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
        </section>

        {/* TOP SONGS – NORMAL LIST, KOI INNER SCROLL NAHI */}
        {topSongs.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xl lg:text-2xl font-semibold">Top Songs</h2>
            <div className="flex flex-col gap-2">
              {topSongs.map((song) => (
                <SongsList key={song.id} {...song} song={topSongs} />
              ))}
            </div>
          </section>
        )}

        {/* TOP ALBUMS – HOME PAGE WALA SLIDER STYLE */}
        {topAlbums.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xl lg:text-2xl font-semibold">Top Albums</h2>
            <AlbumSlider albums={topAlbums} />
          </section>
        )}

        {/* SINGLES – NEW SONGS WALA CARD STYLE */}
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
                  <SongGrid
                    key={single.id}
                    {...single}
                    song={singles}
                    // Agar single ke andar songs[] ho to pehla song play kare
                    downloadUrl={
                      single.downloadUrl ||
                      single.songs?.[0]?.downloadUrl ||
                      single.perma_url
                    }
                    image={single.image || single.songs?.[0]?.image}
                    artists={single.artists || single.songs?.[0]?.artists}
                    duration={single.duration || single.songs?.[0]?.duration}
                    name={single.name || single.title}
                  />
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
