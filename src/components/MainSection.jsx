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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [list, setList] = useState({});
  
  const recentScrollRef = useRef(null);
  const latestSongsScrollRef = useRef(null);
  const trendingScrollRef = useRef(null);

  const getRecentlyPlayedSongs = () => {
    const playedSongs = JSON.parse(localStorage.getItem("playedSongs")) || [];
    return playedSongs.slice(0, 12);
  };

  const recentlyPlayedSongs = getRecentlyPlayedSongs();

  const scrollLeft = (scrollRef) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= 600;
    }
  };

  const scrollRight = (scrollRef) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 600;
    }
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    return hours < 12
      ? "Good Morning"
      : hours < 18
      ? "Good Afternoon"
      : "Good Evening";
  };

  useEffect(() => {
    const fetchSongData = async () => {
      try {
        const song = await fetchplaylistsByID(110858205);
        setTrending(song.data.songs.slice(0, 12));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchlatestSongData = async () => {
      try {
        const latestSongs = await fetchplaylistsByID(6689255);
        setlatestSongs(latestSongs.data.songs.slice(0, 12));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchAlbumData = async () => {
      try {
        const album = await searchAlbumByQuery("latest");
        setAlbums(album.data.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchArtistData = async () => {
      try {
        const artist = await artistData;
        setArtists(artist.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchPlaylistData = async () => {
      try {
        const playlist = await searchPlayListByQuery("Top");
        setPlaylists(playlist.data.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSongData();
    fetchAlbumData();
    fetchArtistData();
    fetchPlaylistData();
    fetchlatestSongData();
  }, []);

  useEffect(() => {
    const combineArray = [
      ...recentlyPlayedSongs,
      ...trending,
      ...latestSongs,
    ];
    const uniqueSongs = combineArray.filter(
      (song, index, self) => index === self.findIndex((t) => t.id === song.id)
    );
    setList(uniqueSongs);
  }, [trending, latestSongs]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="pt-[3rem] lg:pt-5 my-[2rem] mt-[5rem] lg:my-[4rem] flex flex-col items-center overflow-x-clip gap-[1.5rem]">
      <div className="hidden lg:block text-2xl w-full font-semibold lg:ml-[5.5rem] m-1">
        {getGreeting()}
      </div>

      {/* Recently Played - 3×2 Grid, 6 visible, scroll for next 6 */}
      {recentlyPlayedSongs.length > 0 && (
        <div className="flex flex-col w-full">
          <h2 className="m-4 mt-0 text-xl lg:text-2xl font-semibold w-full ml-[1rem] lg:ml-[3.5rem]">
            Recently Played
          </h2>
          <div className="flex justify-center items-center gap-3 w-full">
            <MdOutlineKeyboardArrowLeft
              className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
              onClick={() => scrollLeft(recentScrollRef)}
            />
            {/* 3 columns, 2 rows, horizontal scroll */}
            <div
              className="grid grid-cols-3 grid-rows-2 gap-3 lg:gap-4 overflow-x-auto scroll-hide scroll-smooth w-full lg:w-[85%] px-3 lg:px-0"
              ref={recentScrollRef}
              style={{ 
                gridAutoFlow: 'column',
                gridAutoColumns: 'minmax(0, 1fr)'
              }}
            >
              {recentlyPlayedSongs.map((song, index) => (
                <RecentPlayedCard key={song.id || index} {...song} song={list} />
              ))}
            </div>
            <MdOutlineKeyboardArrowRight
              className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
              onClick={() => scrollRight(recentScrollRef)}
            />
          </div>
        </div>
      )}

      {/* New Songs - Perfect as is */}
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

      {/* Today Trending - 4 cards per view, side card visible */}
      <div className="flex flex-col w-full">
        <h2 className="m-4 mt-0 text-xl lg:text-2xl font-semibold w-full ml-[1rem] lg:ml-[3.5rem]">
          Today Trending
        </h2>
        <div className="flex justify-center items-center gap-3 w-full">
          <MdOutlineKeyboardArrowLeft
            className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
            onClick={() => scrollLeft(trendingScrollRef)}
          />
          {/* 2 rows, 2 columns visible at a time, scroll for more */}
          <div
            className="grid grid-rows-2 grid-cols-2 lg:grid-rows-2 lg:grid-cols-2 gap-3 overflow-x-auto scroll-hide scroll-smooth w-full lg:w-[85%] px-3 lg:px-0"
            ref={trendingScrollRef}
            style={{ 
              gridAutoFlow: 'column',
              gridAutoColumns: 'minmax(0, 1fr)'
            }}
          >
            {trending.map((song) => (
              <TrendingCard key={song.id} {...song} song={list} />
            ))}
          </div>
          <MdOutlineKeyboardArrowRight
            className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
            onClick={() => scrollRight(trendingScrollRef)}
          />
        </div>
      </div>

      <br />

      {/* Top Albums Section */}
      <div className="w-full">
        <h2 className="m-4 mt-0 text-xl lg:text-2xl font-semibold w-full ml-[1rem] lg:ml-[3rem]">
          Top Albums
        </h2>
        <AlbumSlider albums={albums} />
      </div>
      <br />

      {/* Top Artists Section */}
      <div className="w-full">
        <h2 className="pr-1 m-4 mt-0 text-xl lg:text-2xl font-semibold w-full ml-[1rem] lg:ml-[3.5rem]">
          Top Artists
        </h2>
        <ArtistSlider artists={artists} />
      </div>
      <br />

      {/* Top Playlists Section */}
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
