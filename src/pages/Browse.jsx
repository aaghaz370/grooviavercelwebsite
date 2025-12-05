import { useEffect, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Navigator from "../components/Navigator";
import Player from "../components/Player";
import { genreData } from "../genreData";
import he from "he";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import {
  getArtistbyQuery,
  getSearchData,
  getSongbyQuery,
  getSuggestionSong,
} from "../../fetch";
import MusicContext from "../context/MusicContext";

function Browse() {
  // ---- SEARCH BAR STATE ----
  const { playMusic } = useContext(MusicContext);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  let List = [];
  const navigate = useNavigate();

  // ---- DISCOVER / GENRE STATE ----
  const genres = [
    "For You",
    "Hindi",
    "English",
    "Punjabi",
    "Rajasthani",
    "Haryanvi",
    "Telugu",
    "Marathi",
    "Gujarati",
    "Bengali",
    "Kannada",
  ];
  const [selectedGenre, setSelectedGenre] = useState("For You");
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const api_url = import.meta.env.VITE_API_URL;

  // --------- SEARCH LOGIC (suggestions + submit) ----------
  const fetchSuggestions = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const result = await getSearchData(searchTerm);
      const song = await getSongbyQuery(searchTerm, 8);
      const artist = await getArtistbyQuery(searchTerm, 8);

      const allSuggestions = [];

      if (song?.data?.results) {
        allSuggestions.push(
          ...song.data.results.map((item) => ({
            type: "Song",
            name: item.name,
            id: item.id,
            duration: item.duration,
            artist: item.artists,
            image: item.image[2].url,
            downloadUrl: item.downloadUrl[4].url,
          }))
        );
      }

      if (result?.data?.albums?.results) {
        allSuggestions.push(
          ...result.data.albums.results.map((item) => ({
            type: "Album",
            name: item.title,
            id: item.id,
            artist: item.artist,
            image: item.image?.[2]?.url,
          }))
        );
      }

      if (result?.data?.playlists?.results) {
        allSuggestions.push(
          ...result.data.playlists.results.map((item) => ({
            type: "Playlist",
            name: item.title,
            id: item.id,
            image: item.image[2].url,
          }))
        );
      }

      if (artist?.data?.results) {
        allSuggestions.push(
          ...artist.data.results.map((item) => ({
            type: item.type,
            name: item.name,
            id: item.id,
            image: item.image[2].url,
          }))
        );
      }

      setSuggestions(allSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  const handleSearchInputChange = (event) => {
    const searchTerm = event.target.value;
    setQuery(searchTerm);
    fetchSuggestions(searchTerm);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (query.trim()) {
      navigate(`/search/${query}`);
      setSuggestions([]);
    }
  };

  const GetData = async (suggestion) => {
    const response = await getSuggestionSong(suggestion.id);
    const suggestedSongs = response.data || [];
    return [suggestion, ...suggestedSongs];
  };

  const handleSuggestionClick = async (suggestion) => {
    if (suggestion.type === "Song") {
      List = await GetData(suggestion);
    }

    switch (suggestion.type) {
      case "Song":
        playMusic(
          suggestion.downloadUrl,
          suggestion.name,
          suggestion.duration,
          suggestion.image,
          suggestion.id,
          suggestion.artist,
          List
        );
        break;
      case "Album":
        navigate(`/albums/${suggestion.id}`);
        break;
      case "artist":
        navigate(`/artists/${suggestion.id}`);
        break;
      case "Playlist":
        navigate(`/playlists/${suggestion.id}`);
        break;
      default:
        console.warn("Unknown suggestion type:", suggestion.type);
    }

    setQuery("");
    setSuggestions([]);
  };

  // --------- DISCOVER GENRE / PLAYLIST LOGIC ----------
  useEffect(() => {
    setPlaylists(genreData["For You"]);
  }, []);

  const handleGenreClick = async (genre) => {
    setSelectedGenre(genre);

    if (genre === "For You") {
      setPlaylists(genreData["For You"]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${api_url}search/playlists?query=${genre.toLowerCase()}&limit=30`
      );
      const data = await response.json();
      setPlaylists(data.data.results || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= 800;
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 800;
    }
  };

  const handlePlaylistClick = (playlist) => {
    navigate(`/playlists/${playlist.id}`);
  };

  // --------- UI ----------
  return (
    <>
      <Navbar />

      <div className="mt-[8.3rem] lg:mt-[6rem] mb-[12rem] lg:mb-[4rem]">
        {/* SEARCH BAR (top, like YouTube Music Discover) */}
        <div className="px-4 mb-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex w-full">
                <input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Search for Songs, Artists, and Playlists"
                  className="flex-grow h-12 p-1 pl-5 rounded-l-xl bg-groovia-card border-2 border-groovia-border focus:outline-none focus:border-groovia-accent transition-colors"
                  value={query}
                  onChange={handleSearchInputChange}
                  autoComplete="off"
                  autoCorrect="off"
                />
                <button
                  type="submit"
                  className="search-btn h-12 w-12 rounded-r-xl flex items-center justify-center"
                >
                  <IoSearchOutline className="text-2xl text-white" />
                </button>
              </div>

              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <div className="suggestionSection absolute top-14 left-0 right-0 p-3 grid grid-cols-2 gap-3 rounded-xl w-full max-h-[28rem] overflow-auto shadow-groovia-lg z-50">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hoover"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <img
                        src={suggestion.image}
                        alt=""
                        className="h-[3.5rem] w-[3.5rem] rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                        <span className="text-sm font-semibold truncate">
                          {he.decode(suggestion.name)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {suggestion.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* GENRE CHIPS + FOR YOU PLAYLISTS (old Discover UI) */}
        <ul className="flex scroll-smooth items-center lg:justify-center gap-[1rem] px-5 py-2 overflow-scroll scroll-hide lg:overflow-auto lg:flex-wrap">
          {genres.map((genre) => (
            <pre
              key={genre}
              onClick={() => handleGenreClick(genre)}
              className={`flex font-semibold items-center cursor-pointer w-auto p-1 list-none border border-zinc-700 text-center px-5 text-base rounded-3xl transition-all duration-75
              ${
                selectedGenre === genre
                  ? "search-btn arrow-btnn"
                  : "navigator"
              }`}
            >
              {genre}
            </pre>
          ))}
        </ul>

        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-semibold ml-[1.5rem] lg:ml-[4rem] mt-3">
            • {selectedGenre}
          </h2>

          <div className="flex justify-center items-center">
            <MdOutlineKeyboardArrowLeft
              className="text-3xl w-[2rem] hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer h-[9rem] hidden lg:block arrow-btn"
              onClick={scrollLeft}
            />

            <div
              ref={scrollRef}
              className="grid lg:grid-rows-2 lg:grid-cols-none scroll-smooth grid-cols-2 lg:grid-flow-col-dense gap-[1.4rem] w-full px-[1.4rem] overflow-x-scroll scroll-hide"
            >
              {loading ? (
                <span className="text-center col-span-full">
                  Loading playlists...
                </span>
              ) : playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <span
                    key={playlist.id}
                    onClick={() => handlePlaylistClick(playlist)}
                    className="h-[13rem] overflow-hidden w-[10rem] cursor-pointer py-1 card rounded-md"
                  >
                    <img
                      src={playlist.image[2].url}
                      className="h-[10rem] p-3 rounded-2xl hover:brightness-[0.65]"
                    />
                    <p className="text-center text-[14px] px-1">
                      {playlist.name
                        ? he.decode(playlist.name)
                        : "Empty"}
                    </p>
                  </span>
                ))
              ) : (
                <span className="text-center col-span-full">
                  No playlists found.
                </span>
              )}
            </div>

            <MdOutlineKeyboardArrowRight
              className="text-3xl w-[2rem] hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer h-[9rem] hidden lg:block arrow-btn"
              onClick={scrollRight}
            />
          </div>
        </div>
      </div>

      <Player />
      <Navigator />
    </>
  );
}

export default Browse;
