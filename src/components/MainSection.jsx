import { useEffect, useState, useRef } from "react";
import {
  fetchplaylistsByID,
  searchAlbumByQuery,
  searchPlayListByQuery,
} from "../../fetch";

import AlbumSlider from "./Sliders/AlbumSlider";
import PlaylistSlider from "./Sliders/PlaylistSlider";
import ArtistSlider from "./Sliders/ArtistSlider";
import RecentPlayedCard from "./RecentPlayedCard";
import NewSongCard from "./NewSongCard";
import TrendingCard from "./TrendingCard";
import GoldenEraSection from "./sections/GoldenEraSection";
import MoodSection from "./sections/MoodSection";
import CommunitySection from "./sections/CommunitySection";

import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

import { artistData } from "../genreData";

const MainSection = () => {
  const [trending, setTrending] = useState([]);
  const [latestSongs, setlatestSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [nowTrending, setNowTrending] = useState([]);


  // ❤️ Most Streamed Love Songs – Hindi
  const [loveSongs, setLoveSongs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [list, setList] = useState([]);
  

  // Scroll refs
  const recentScrollRef = useRef(null);
  const latestSongsScrollRef = useRef(null);
  const trendingScrollRef = useRef(null);
  const loveScrollRef = useRef(null);
  const nowTrendingScrollRef = useRef(null);

  // Recently Played from localStorage
  const getRecentlyPlayedSongs = () => {
    const playedSongs = JSON.parse(localStorage.getItem("playedSongs")) || [];
    return playedSongs.slice(0, 12);
  };
  const recentlyPlayedSongs = getRecentlyPlayedSongs();

  const scrollLeft = (scrollRef) => {
    if (scrollRef.current) scrollRef.current.scrollLeft -= 800;
  };
  const scrollRight = (scrollRef) => {
    if (scrollRef.current) scrollRef.current.scrollLeft += 800;
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    return hours < 12
      ? "Good Morning"
      : hours < 18
      ? "Good Afternoon"
      : "Good Evening";
  };

  // ---------- MAIN HOME DATA (pehle se tha) ----------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Today Trending
        const song = await fetchplaylistsByID(110858205);
        setTrending(song.data.songs.slice(0, 12));

        // New Songs
        const latestSongsRes = await fetchplaylistsByID(6689255);
        setlatestSongs(latestSongsRes.data.songs.slice(0, 12));

        // Albums
        const albumRes = await searchAlbumByQuery("latest");
        setAlbums(albumRes.data.results);

        // Artists (static file se)
        const artist = await artistData;
        setArtists(artist.results);

        // Top Playlists
        const playlistRes = await searchPlayListByQuery("Top");
        setPlaylists(playlistRes.data.results);
      } catch (err) {
        setError(err.message || "Error while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // ---------- NEW: MOST STREAMED LOVE SONGS SECTION ----------
  useEffect(() => {
    const fetchLoveSongs = async () => {
      try {
        // 1) Search playlist by name
        const res = await searchPlayListByQuery(
          "Most Streamed Love Songs Hindi"
        );

        const results = res?.data?.results || [];
        if (!results.length) return;

        // 2) Try to find EXACT playlist using name/perma_url
        const match =
          results.find(
            (p) =>
              p.perma_url?.includes("most-streamed-love-songs-hindi") ||
              p.url?.includes("most-streamed-love-songs-hindi") ||
              p.name
                ?.toLowerCase()
                .includes("most streamed love songs - hindi")
          ) || results[0];

        // 3) Now fetch full playlist by its numeric ID
        const playlist = await fetchplaylistsByID(match.id);
        const songs = playlist?.data?.songs || [];

        // 4) Sirf 28 songs rakhte hain (4–4 stack ke hisaab se)
        setLoveSongs(songs.slice(0, 28));
      } catch (e) {
        console.error("Love songs section error:", e);
      }
    };

    fetchLoveSongs();
  }, []);


  useEffect(() => {
  const fetchNowTrending = async () => {
    try {
      // 1) Search playlist by name
      const res = await searchPlayListByQuery("Now Trending");
      const results = res?.data?.results || [];
      if (!results.length) return;

      // 2) Find correct playlist
      const match =
        results.find(
          (p) =>
            p.perma_url?.includes("now-trending") ||
            p.url?.includes("now-trending") ||
            p.name?.toLowerCase().includes("now trending")
        ) || results[0];

      // 3) Full playlist fetch using numeric ID
      const playlist = await fetchplaylistsByID(match.id);
      const songs = playlist?.data?.songs || [];

      // 4) Sirf 24 songs
      setNowTrending(songs.slice(0, 24));
    } catch (e) {
      console.error("Now Trending section error:", e);
    }
  };

  fetchNowTrending();
}, []);

  // ---------- COMBINED LIST PLAYER KE LIYE ----------
  useEffect(() => {
    const combineArray = [
      ...recentlyPlayedSongs,
      ...trending,
      ...latestSongs,
      ...loveSongs,
    ];
    const uniqueSongs = combineArray.filter(
      (song, index, self) => index === self.findIndex((t) => t.id === song.id)
    );
    setList(uniqueSongs);
  }, [trending, latestSongs, loveSongs]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="pt-[3rem] lg:pt-5 mt-[5rem] flex flex-col items-center overflow-x-clip gap-4">
      <div className="hidden lg:block text-2xl w-full font-semibold lg:ml-[5.5rem] m-1">
        {getGreeting()}
      </div>

      {/* ===================== RECENTLY PLAYED ===================== */}
      {recentlyPlayedSongs.length > 0 && (
        <div className="flex flex-col w-full">
          <h2 className="m-4 mt-0 text-xl lg:text-2xl font-semibold w-full lg:ml-[3.5rem] ml-[1rem]">
            Recently Played
          </h2>
          <div className="flex justify-center items-center gap-2 w-full">
            <MdOutlineKeyboardArrowLeft
              className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
              onClick={() => scrollLeft(recentScrollRef)}
            />

            <div className="w-full overflow-hidden px-2 lg:px-0">
              {(() => {
                const rows = recentlyPlayedSongs.length > 3 ? 2 : 1;
                return (
                  <div
                    className="grid gap-2 lg:gap-3 overflow-x-auto scroll-hide scroll-smooth"
                    ref={recentScrollRef}
                    style={{
                      gridTemplateRows: `repeat(${rows}, 1fr)`,
                      gridAutoFlow: "column",
                      gridAutoColumns: "calc(33.333% - 8px)",
                    }}
                  >
                    {recentlyPlayedSongs.slice(0, 12).map((song, index) => (
                      <RecentPlayedCard
                        key={song.id || index}
                        {...song}
                        song={list}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>

            <MdOutlineKeyboardArrowRight
              className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
              onClick={() => scrollRight(recentScrollRef)}
            />
          </div>
        </div>
      )}

      {/* ===================== NEW SONGS ===================== */}
      <div className="flex flex-col w-full">
        <h2 className="m-4 text-xl lg:text-2xl font-semibold w-full ml-[1rem] lg:ml-[3.5rem]">
          New Songs
        </h2>
        <div className="flex justify-center items-center gap-3 w-full">
          <MdOutlineKeyboardArrowLeft
            className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
            onClick={() => scrollLeft(latestSongsScrollRef)}
          />
          <div
            className="grid grid-rows-1 lg:grid-rows-3 grid-flow-col gap-3 lg:gap-3 overflow-x-auto scroll-hide scroll-smooth w-full px-3 lg:px-0"
            ref={latestSongsScrollRef}
          >
            {latestSongs.map((song, index) => (
              <NewSongCard key={song.id || index} {...song} song={list} />
            ))}
          </div>
          <MdOutlineKeyboardArrowRight
            className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
            onClick={() => scrollRight(latestSongsScrollRef)}
          />
        </div>
      </div>

      <br />

      {/* ===================== TODAY TRENDING ===================== */}
      <div className="flex flex-col w-full">
        <h2 className="m-4 mt-0 text-xl lg:text-2xl font-semibold w-full lg:ml-[3.5rem] ml-[1rem]">
          Today Trending
        </h2>
        <div className="flex justify-center items-center gap-2 w-full">
          <MdOutlineKeyboardArrowLeft
            className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
            onClick={() => scrollLeft(trendingScrollRef)}
          />
          <div className="w-full overflow-hidden pl-2 lg:pl-0">
            <div
              className="grid gap-2 lg:gap-3 overflow-x-auto scroll-hide scroll-smooth pr-2"
              ref={trendingScrollRef}
              style={{
                gridTemplateRows: "repeat(4, 1fr)",
                gridAutoFlow: "column",
                gridAutoColumns: "85%",
              }}
            >
              {trending.map((song) => (
                <TrendingCard key={song.id} {...song} song={list} />
              ))}
            </div>
          </div>
          <MdOutlineKeyboardArrowRight
            className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
            onClick={() => scrollRight(trendingScrollRef)}
          />
        </div>
      </div>

      

      {/* Mood Playlists – big cards */}
      <MoodSection />

      {/* ===================== MOST STREAMED LOVE SONGS – HINDI ===================== */}
      {loveSongs.length > 0 && (
        <div className="flex flex-col w-full">
          <h2 className="m-4 mt-0 text-xl lg:text-2xl font-semibold w-full lg:ml-[3.5rem] ml-[1rem]">
            Most Streamed Love Songs – Hindi
          </h2>
          <div className="flex justify-center items-center gap-2 w-full">
            <MdOutlineKeyboardArrowLeft
              className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
              onClick={() => scrollLeft(loveScrollRef)}
            />
            <div className="w-full overflow-hidden pl-2 lg:pl-0">
              <div
                className="grid gap-2 lg:gap-3 overflow-x-auto scroll-hide scroll-smooth pr-2"
                ref={loveScrollRef}
                style={{
                  gridTemplateRows: "repeat(4, 1fr)",
                  gridAutoFlow: "column",
                  gridAutoColumns: "85%",
                }}
              >
                {loveSongs.map((song) => (
                  <TrendingCard key={song.id} {...song} song={list} />
                ))}
              </div>
            </div>
            <MdOutlineKeyboardArrowRight
              className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
              onClick={() => scrollRight(loveScrollRef)}
            />
          </div>
        </div>
      )}

      
      {/* From the Community – manual playlists */}
<CommunitySection />
      
      {/* Golden Era Playlists */}
      <GoldenEraSection />

      {/* Top Albums */}
      <div className="w-full">
        <h2 className="m-4 mt-0 text-xl lg:text-2xl font-semibold w-full ml-[1rem] lg:ml-[3rem]">
          Top Albums
        </h2>
        <AlbumSlider albums={albums} />
      </div>

      {/* ===================== TRENDING ON SOCIALS ===================== */}
{nowTrending.length > 0 && (
  <div className="flex flex-col w-full">
    <h2 className="m-4 mt-2 text-xl lg:text-2xl font-semibold w-full lg:ml-[3.5rem] ml-[1rem]">
      Trending on Socials
    </h2>

    <div className="flex justify-center items-center gap-2 w-full">
      <MdOutlineKeyboardArrowLeft
        className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
        onClick={() => scrollLeft(nowTrendingScrollRef)}
      />

      <div className="w-full overflow-hidden pl-2 lg:pl-0">
        <div
          className="grid gap-2 lg:gap-3 overflow-x-auto scroll-hide scroll-smooth pr-2"
          ref={nowTrendingScrollRef}
          style={{
            gridTemplateRows: "repeat(4, 1fr)",
            gridAutoFlow: "column",
            gridAutoColumns: "85%",
          }}
        >
          {nowTrending.map((song) => (
            <TrendingCard key={song.id} {...song} song={list} />
          ))}
        </div>
      </div>

      <MdOutlineKeyboardArrowRight
        className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
        onClick={() => scrollRight(nowTrendingScrollRef)}
      />
    </div>
  </div>
)}

      {/* Top Artists */}
      <div className="w-full">
        <h2 className="pr-1 m-4 mt-0 text-xl lg:text-2xl font-semibold w-full ml-[1rem] lg:ml-[3.5rem]">
          Top Artists
        </h2>
        <ArtistSlider artists={artists} />
      </div>

      {/* Top Playlists */}
      <div className="w-full flex flex-col gap-3">
        <h2 className="m-1 text-xl lg:text-2xl font-semibold w-full ml-[1rem] lg:ml-[2.8rem]">
          Top Playlists
        </h2>
        <PlaylistSlider playlists={playlists} />
      </div>
    </div>
  );
};



export default MainSection;
