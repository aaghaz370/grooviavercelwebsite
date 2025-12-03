import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getArtistbyQuery, getSearchData, getSongbyQuery, getSuggestionSong } from "../../fetch";
import MusicContext from "../context/MusicContext";
import Navbar from "../components/Navbar";
import Navigator from "../components/Navigator";
import Player from "../components/Player";
import he from "he";
import { IoSearchOutline } from "react-icons/io5";

const Browse = () => {
  const { playMusic } = useContext(MusicContext);
  const [query, setQuery] = useState("");
  let List = [];
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const result = await getSearchData(query);
      const song = await getSongbyQuery(query, 8);
      const artist = await getArtistbyQuery(query, 8);

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
      if (artist?.data.results) {
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 pb-20 px-4">
        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl font-bold mb-6">Search</h1>
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

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="suggestionSection absolute top-14 left-0 right-0 p-3 grid grid-cols-1 lg:grid-cols-2 gap-3 rounded-xl w-full max-h-[25rem] overflow-auto shadow-groovia-lg z-50">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hoover"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <img
                      src={suggestion.image}
                      alt=""
                      className="h-[3.5rem] w-[3.5rem] rounded-lg object-cover"
                    />
                    <div className="flex flex-col overflow-hidden flex-1">
                      <span className="text-sm font-semibold truncate">
                        {he.decode(suggestion.name)}
                      </span>
                      <span className="text-xs text-gray-400">{suggestion.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Browse Categories */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Browse All</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Cards */}
            <div className="card p-6 rounded-xl h-32 flex items-end bg-gradient-to-br from-purple-600 to-purple-900 cursor-pointer hover:scale-105 transition-transform">
              <h3 className="text-xl font-bold">Hindi</h3>
            </div>
            <div className="card p-6 rounded-xl h-32 flex items-end bg-gradient-to-br from-blue-600 to-blue-900 cursor-pointer hover:scale-105 transition-transform">
              <h3 className="text-xl font-bold">English</h3>
            </div>
            <div className="card p-6 rounded-xl h-32 flex items-end bg-gradient-to-br from-green-600 to-green-900 cursor-pointer hover:scale-105 transition-transform">
              <h3 className="text-xl font-bold">Punjabi</h3>
            </div>
            <div className="card p-6 rounded-xl h-32 flex items-end bg-gradient-to-br from-red-600 to-red-900 cursor-pointer hover:scale-105 transition-transform">
              <h3 className="text-xl font-bold">Tamil</h3>
            </div>
          </div>
        </div>
      </div>
      <Navigator />
      <Player />
    </>
  );
};

export default Browse;
