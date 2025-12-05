import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  getSongbyQuery,
  searchAlbumByQuery,
  searchArtistByQuery,
  searchPlayListByQuery,
} from "../../fetch";
import Navbar from "../components/Navbar";
import Player from "../components/Player";
import Footer from "../components/footer";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import AlbumSlider from "../components/Sliders/AlbumSlider";
import PlaylistSlider from "../components/Sliders/PlaylistSlider";
import ArtistSlider from "../components/Sliders/ArtistSlider";
import Navigator from "../components/Navigator";

// ye dono already Home pe use ho rahe hain
import TrendingCard from "../components/TrendingCard";
import NewSongCard from "../components/NewSongCard";

const SearchResult = () => {
  const { query } = useParams();
  const [songResults, setSongResults] = useState([]);
  const [AlbumResults, setAlbumsResults] = useState([]);
  const [ArtistsResults, setArtistsResults] = useState([]);
  const [PlaylistsResults, setPlaylistsResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const topSongsScrollRef = useRef(null);   // 4-4-4 wale
  const moreSongsScrollRef = useRef(null);  // New Songs style wale

  useEffect(() => {
    const fetchSearchResult = async () => {
      try {
        const song = await getSongbyQuery(query, 30);
        setSongResults(song.data.results || []);

        const Album = await searchAlbumByQuery(query);
        setAlbumsResults(Album.data.results || []);

        const Artist = await searchArtistByQuery(query);
        setArtistsResults(Artist.data.results || []);

        const Playlist = await searchPlayListByQuery(query);
        setPlaylistsResults(Playlist.data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResult();
  }, [query]);

  const scrollLeft = (ref) => {
    if (ref.current) {
      ref.current.scrollLeft -= 800;
    }
  };

  const scrollRight = (ref) => {
    if (ref.current) {
      ref.current.scrollLeft += 800;
    }
  };

  // songs ka split – 12 top, baaki niche
  const topSongs = songResults.slice(0, 12);
  const moreSongs = songResults.slice(12);

  return (
    <>
      <Navbar />
      <div className="mt-[8rem] lg:mt-[6rem] pb-[4rem] gap-6 flex flex-col">
        {/* Heading */}
        <h2 className="text-2xl font-semibold ml-[1rem] lg:ml-[3rem] flex flex-col gap-2">
          Search Results for &quot;{query}&quot;
          <span className="text-xl">Songs</span>
        </h2>

        {/* SONGS SECTION */}
        {loading && <p className="ml-[1rem] lg:ml-[3rem]">Loading...</p>}
        {error && <p className="ml-[1rem] lg:ml-[3rem] text-red-500">{error}</p>}

        {songResults.length === 0 && !loading && !error && (
          <p className="ml-[1rem] lg:ml-[3rem] text-gray-400">No songs found.</p>
        )}

        {songResults.length > 0 && (
          <>
            {/* 1) First 12 songs – Today Trending style (4-4-4) */}
            {topSongs.length > 0 && (
              <div className="flex justify-center items-center gap-2 w-full">
                <MdOutlineKeyboardArrowLeft
                  className="text-3xl w-[2rem] hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer h-[9rem] arrow-btn hidden lg:block"
                  onClick={() => scrollLeft(topSongsScrollRef)}
                />

                <div className="w-full overflow-hidden pl-2 lg:pl-0">
                  <div
                    className="grid gap-2 lg:gap-3 overflow-x-auto scroll-hide scroll-smooth pr-2"
                    ref={topSongsScrollRef}
                    style={{
                      gridTemplateRows: "repeat(4, 1fr)",
                      gridAutoFlow: "column",
                      gridAutoColumns: "85%",
                    }}
                  >
                    {topSongs.map((song) => (
                      <TrendingCard
                        key={song.id}
                        {...song}
                        song={songResults} // list pass for next/prev
                      />
                    ))}
                  </div>
                </div>

                <MdOutlineKeyboardArrowRight
                  className="text-3xl w-[2rem] hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer h-[9rem] arrow-btn hidden lg:block"
                  onClick={() => scrollRight(topSongsScrollRef)}
                />
              </div>
            )}

            {/* 2) Remaining songs – New Songs style slider */}
            {moreSongs.length > 0 && (
              <div className="flex flex-col w-full mt-4 gap-2">
                <p className="text-lg font-semibold ml-[1rem] lg:ml-[3rem]">
                  More Songs
                </p>
                <div className="flex justify-center items-center gap-3 w-full">
                  <MdOutlineKeyboardArrowLeft
                    className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
                    onClick={() => scrollLeft(moreSongsScrollRef)}
                  />
                  <div
                    className="grid grid-rows-1 lg:grid-rows-3 grid-flow-col gap-3 lg:gap-3 overflow-x-auto scroll-hide scroll-smooth w-full px-3 lg:px-0"
                    ref={moreSongsScrollRef}
                  >
                    {moreSongs.map((song) => (
                      <NewSongCard
                        key={song.id}
                        {...song}
                        song={songResults}
                      />
                    ))}
                  </div>
                  <MdOutlineKeyboardArrowRight
                    className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
                    onClick={() => scrollRight(moreSongsScrollRef)}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* ALBUMS */}
        {AlbumResults.length > 0 && (
          <>
            <p className="text-xl font-semibold ml-[1rem] lg:ml-[3rem]">
              Albums
            </p>
            <AlbumSlider albums={AlbumResults} />
          </>
        )}

        {/* PLAYLISTS */}
        {PlaylistsResults.length > 0 && (
          <>
            <p className="text-xl font-semibold ml-[1rem] lg:ml-[3rem]">
              Playlists
            </p>
            <PlaylistSlider playlists={PlaylistsResults} />
          </>
        )}

        {/* ARTISTS */}
        {ArtistsResults.length > 0 && (
          <>
            <p className="text-xl font-semibold ml-[1rem] lg:ml-[3rem]">
              Artists
            </p>
            <ArtistSlider artists={ArtistsResults} />
          </>
        )}
      </div>

      <Footer />
      <Navigator />
      <Player />
    </>
  );
};

export default SearchResult;
