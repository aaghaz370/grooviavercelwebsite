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

import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

import { artistData } from "../genreData";

const LOVE_PLAYLIST_ID = "RQKZhDpGh8uAIonqf0gmcg__";

const MainSection = () => {
  const [trending, setTrending] = useState([]);
  const [latestSongs, setlatestSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loveHits, setLoveHits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [list, setList] = useState([]);

  const recentScrollRef = useRef(null);
  const latestSongsScrollRef = useRef(null);
  const trendingScrollRef = useRef(null);
  const loveScrollRef = useRef(null);

  // Recently Played
  const recentlyPlayedSongs = JSON.parse(localStorage.getItem("playedSongs")) || [];

  // Scroll
  const scrollLeft = (ref) => ref.current && (ref.current.scrollLeft -= 800);
  const scrollRight = (ref) => ref.current && (ref.current.scrollLeft += 800);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
  };

  // Fetch all sections
  useEffect(() => {
    const load = async () => {
      try {
        // Today Trending
        const t = await fetchplaylistsByID(110858205);
        setTrending(t.data.songs.slice(0, 12));

        // New Songs
        const ls = await fetchplaylistsByID(6689255);
        setlatestSongs(ls.data.songs.slice(0, 12));

        // Albums
        const alb = await searchAlbumByQuery("latest");
        setAlbums(alb.data.results);

        // Artists
        const art = await artistData;
        setArtists(art.results);

        // Top Playlists
        const pl = await searchPlayListByQuery("Top");
        setPlaylists(pl.data.results);

        // ❤️ Most Streamed Love Songs
        const love = await fetchplaylistsByID(LOVE_PLAYLIST_ID);
        setLoveHits(love.data.songs.slice(0, 28));

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Combine list for music player context
  useEffect(() => {
    const combined = [
      ...recentlyPlayedSongs.slice(0, 12),
      ...trending,
      ...latestSongs,
    ];

    const unique = combined.filter(
      (s, i, arr) => i === arr.findIndex((x) => x.id === s.id)
    );

    setList(unique);
  }, [trending, latestSongs]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="pt-[3rem] lg:pt-5 mt-[5rem] flex flex-col items-center overflow-x-clip gap-4">

      {/* Greeting */}
      <div className="hidden lg:block text-2xl w-full font-semibold lg:ml-[5.5rem] m-1">
        {greeting()}
      </div>

      {/* Recently Played */}
      {recentlyPlayedSongs.length > 0 && (
        <div className="flex flex-col w-full">
          <h2 className="m-4 mt-0 text-xl lg:text-2xl font-semibold ml-[1rem] lg:ml-[3.5rem]">
            Recently Played
          </h2>

          <div className="flex items-center gap-2 w-full">
            <MdOutlineKeyboardArrowLeft
              className="hidden lg:block text-3xl cursor-pointer arrow-btn hover:scale-125"
              onClick={() => scrollLeft(recentScrollRef)}
            />

            <div className="w-full overflow-hidden px-2">
              <div
                ref={recentScrollRef}
                className="grid gap-2 lg:gap-3 scroll-hide scroll-smooth"
                style={{
                  gridTemplateRows: `repeat(${recentlyPlayedSongs.length > 3 ? 2 : 1}, 1fr)`,
                  gridAutoFlow: "column",
                  gridAutoColumns: "calc(33.333% - 8px)",
                }}
              >
                {recentlyPlayedSongs.slice(0, 12).map((s, i) => (
                  <RecentPlayedCard key={s.id || i} {...s} song={list} />
                ))}
              </div>
            </div>

            <MdOutlineKeyboardArrowRight
              className="hidden lg:block text-3xl cursor-pointer arrow-btn hover:scale-125"
              onClick={() => scrollRight(recentScrollRef)}
            />
          </div>
        </div>
      )}

      {/* New Songs */}
      <div className="flex flex-col w-full">
        <h2 className="m-4 text-xl lg:text-2xl font-semibold ml-[1rem] lg:ml-[3.5rem]">
          New Songs
        </h2>

        <div className="flex items-center gap-3 w-full">
          <MdOutlineKeyboardArrowLeft
            className="hidden lg:block text-3xl cursor-pointer arrow-btn hover:scale-125"
            onClick={() => scrollLeft(latestSongsScrollRef)}
          />

          <div
            ref={latestSongsScrollRef}
            className="grid grid-rows-1 lg:grid-rows-3 grid-flow-col gap-3 overflow-x-auto scroll-hide scroll-smooth px-3"
          >
            {latestSongs.map((song, i) => (
              <NewSongCard key={song.id || i} {...song} song={list} />
            ))}
          </div>

          <MdOutlineKeyboardArrowRight
            className="hidden lg:block text-3xl cursor-pointer arrow-btn hover:scale-125"
            onClick={() => scrollRight(latestSongsScrollRef)}
          />
        </div>
      </div>

      {/* Today Trending */}
      <div className="flex flex-col w-full">
        <h2 className="m-4 text-xl lg:text-2xl font-semibold ml-[1rem] lg:ml-[3.5rem]">
          Today Trending
        </h2>

        <div className="flex items-center gap-2 w-full">
          <MdOutlineKeyboardArrowLeft
            className="hidden lg:block text-3xl cursor-pointer hover:scale-125"
            onClick={() => scrollLeft(trendingScrollRef)}
          />

          <div className="w-full overflow-hidden pl-2">
            <div
              ref={trendingScrollRef}
              className="grid gap-2 lg:gap-3 overflow-x-auto scroll-hide scroll-smooth pr-2"
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
            className="hidden lg:block text-3xl cursor-pointer hover:scale-125"
            onClick={() => scrollRight(trendingScrollRef)}
          />
        </div>
      </div>

      {/* ❤️ MOST STREAMED LOVE SONGS SECTION (NEW) */}
      {loveHits.length > 0 && (
        <div className="flex flex-col w-full">
          <h2 className="m-4 text-xl lg:text-2xl font-semibold ml-[1rem] lg:ml-[3.5rem]">
            Most Streamed Love Songs – Hindi
          </h2>

          <div className="flex items-center gap-2 w-full">
            <MdOutlineKeyboardArrowLeft
              className="hidden lg:block text-3xl cursor-pointer hover:scale-125"
              onClick={() => scrollLeft(loveScrollRef)}
            />

            <div className="w-full overflow-hidden pl-2">
              <div
                ref={loveScrollRef}
                className="grid gap-2 lg:gap-3 overflow-x-auto scroll-hide scroll-smooth pr-2"
                style={{
                  gridTemplateRows: "repeat(4, 1fr)",
                  gridAutoFlow: "column",
                  gridAutoColumns: "85%",
                }}
              >
                {loveHits.map((song) => (
                  <TrendingCard key={song.id} {...song} song={list} />
                ))}
              </div>
            </div>

            <MdOutlineKeyboardArrowRight
              className="hidden lg:block text-3xl cursor-pointer hover:scale-125"
              onClick={() => scrollRight(loveScrollRef)}
            />
          </div>
        </div>
      )}

      {/* Playlists */}
      <MoodSection />
      <GoldenEraSection />

      {/* Albums */}
      <div className="w-full">
        <h2 className="m-4 mt-0 text-xl lg:text-2xl font-semibold ml-[1rem] lg:ml-[3rem]">
          Top Albums
        </h2>
        <AlbumSlider albums={albums} />
      </div>

      {/* Artists */}
      <div className="w-full">
        <h2 className="m-4 mt-0 text-xl lg:text-2xl font-semibold ml-[1rem] lg:ml-[3.5rem]">
          Top Artists
        </h2>
        <ArtistSlider artists={artists} />
      </div>

      {/* Playlists */}
      <div className="w-full flex flex-col gap-3">
        <h2 className="m-1 text-xl lg:text-2xl font-semibold ml-[1rem] lg:ml-[2.8rem]">
          Top Playlists
        </h2>
        <PlaylistSlider playlists={playlists} />
      </div>

    </div>
  );
};

export default MainSection;
