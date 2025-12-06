import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import SongsList from "../components/SongsList";
import Player from "../components/Player";
import {
  fetchAlbumByID,
  getSuggestionSong,
  searchAlbumByQuery,
} from "../../fetch";
import Footer from "../components/footer";
import Navigator from "../components/Navigator";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import SongGrid from "../components/SongGrid";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { IoShareSocial } from "react-icons/io5";
import AlbumSlider from "../components/Sliders/AlbumSlider";
import ArtistSlider from "../components/Sliders/ArtistSlider";

const AlbumDetail = () => {
  const { id } = useParams(); // album id from URL
  const [details, setDetails] = useState(null);
  const [suggetions, setSuggetion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState({});
  const [error, setError] = useState(null);

  const [likedAlbums, setLikedAlbums] = useState(() => {
    return JSON.parse(localStorage.getItem("likedAlbums")) || [];
  });

  // NEW: extra sections
  const [similarAlbums, setSimilarAlbums] = useState([]);
  const [albumArtists, setAlbumArtists] = useState([]);

  const scrollRef = useRef(null);

  const scrollLeft = (scrollRef) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= 1000;
    }
  };

  const scrollRight = (scrollRef) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 1000;
    }
  };

  // ------------ MAIN ALBUM + SUGGESTION FETCH ------------
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await fetchAlbumByID(id);
        setDetails(data);

        const sugid = data?.data?.songs?.[0]?.id;
        if (sugid) {
          const suggestions = await getSuggestionSong(sugid);
          setSuggetion(suggestions.data || []);
        } else {
          setSuggetion([]);
        }

        const albumSongs = data.data.songs || [];
        setList(albumSongs);
      } catch (err) {
        setError("Error fetching album details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // ------------ LIKE / UNLIKE ALBUM ------------
  const toggleLikeAlbum = () => {
    let storedLiked = JSON.parse(localStorage.getItem("likedAlbums")) || [];

    if (storedLiked.some((album) => album.id === details.data.id)) {
      storedLiked = storedLiked.filter((album) => album.id !== details.data.id);
    } else {
      storedLiked.push({
        id: details.data.id,
        name: details.data.name,
        image: details.data.image[2]?.url,
        artists: details.data.artists,
      });
    }

    setLikedAlbums(storedLiked);
    localStorage.setItem("likedAlbums", JSON.stringify(storedLiked));
  };

  // ------------ ARTISTS IN THIS ALBUM ------------
  useEffect(() => {
    const albumData = details?.data;
    if (!albumData) return;

    const songArtists =
      albumData.songs?.flatMap((s) => s.artists?.primary || []) || [];

    const topArtists = albumData.artists?.primary || [];

    const all = [...songArtists, ...topArtists];

    const unique = all.filter(
      (a, i, self) => a.id && i === self.findIndex((t) => t.id === a.id)
    );

    setAlbumArtists(unique);
  }, [details]);

  // ------------ SIMILAR ALBUMS ------------
  useEffect(() => {
    const albumData = details?.data;
    if (!albumData) return;

    const fetchSimilar = async () => {
      try {
        const primaryArtistName =
          albumData.artists?.primary?.[0]?.name ||
          albumData.songs?.[0]?.artists?.primary?.[0]?.name ||
          null;

        const baseQuery =
          primaryArtistName ||
          albumData.name?.split("-")[0].trim() ||
          albumData.name;

        const similarRes = await searchAlbumByQuery(baseQuery);
        const all = similarRes?.data?.results || [];

        const filtered = all
          .filter((a) => a.id !== albumData.id)
          .slice(0, 10);

        setSimilarAlbums(filtered);
      } catch (e) {
        console.error("similar albums fetch error", e);
      }
    };

    fetchSimilar();
  }, [details]);

  // ------------ LOADING / ERROR ------------
  if (loading)
    return (
      <div className="flex h-screen w-screen justify-center items-center ">
        <img src="/Loading.gif" alt="" />
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen w-screen justify-center items-center">
        {error}
      </div>
    );

  const albumdata = details.data || {};
  const primaryArtist = details.data.artists?.primary?.[0] || {};
  const artistId = primaryArtist.id;
  const artistName = primaryArtist.name;

  return (
    <>
      <Navbar />

      <div className="flex flex-col gap-[2rem] lg:gap-[2rem] pt-[10rem] lg:pt-[6rem]">
        {/* Album header */}
        <div className="flex items-center pl-[2rem]">
          <img
            src={details.data.image[2]?.url}
            alt={details.data.name}
            className="h-[8rem] lg:h-[15rem] lg:rounded rounded-full object-cover shadow-2xl shadow-zinc-600"
          />

          <div className="flex flex-col pl-[2rem]">
            <div>
              <h2 className="text-xl lg:text-2xl font-medium lg:font-semibold">
                {details.data.name}
              </h2>
              <pre className="font-sans font-semibold text-sm lg:text-lg">
                {details.data.songCount} Songs by{" "}
                {artistId ? (
                  <Link
                    to={`/artists/${artistId}`}
                    className="hover:underline"
                  >
                    {artistName}
                  </Link>
                ) : (
                  "Unknown Artist"
                )}
              </pre>
            </div>
            <div className="flex gap-2">
              <button
                onClick={toggleLikeAlbum}
                title="Like Album"
                className="border-[1px] mt-3 border-[#8f8f8f6e] h-[3rem] w-[3rem] flex justify-center items-center rounded-full"
              >
                {likedAlbums.some((album) => album.id === albumdata.id) ? (
                  <FaHeart className="text-red-500 text-2xl" />
                ) : (
                  <FaRegHeart className="text-2xl icon" />
                )}
              </button>
              <button
                className="border-[1px] mt-3 border-[#8f8f8f6e] flex justify-center items-center h-[3rem] w-[3rem] rounded-full"
                title="Share"
              >
                <IoShareSocial
                  className="icon text-[1.8rem] mr-[0.1rem]"
                  onClick={() =>
                    navigator.share?.({
                      title: details.data.name,
                      text: `Listen on Musify`,
                      url: `${window.location.origin}/albums/${id}`,
                    })
                  }
                />
              </button>
            </div>
          </div>
        </div>

        {/* Songs list */}
        <div className="flex flex-col h-auto gap-4">
          <div className="flex flex-col gap-2 overflow-y-scroll scroll-smooth scroll-hide pt-3">
            {details.data.songs?.map((song) => (
              <SongsList key={song.id} {...song} song={list} />
            ))}
          </div>
        </div>

        {/* You Might Like */}
        {Array.isArray(suggetions) && suggetions.length > 0 && (
          <div className="flex flex-col justify-center items-center w-full mb-[2rem]">
            <h2 className="lg:ml-[3rem] lg:-translate-x-[37rem] lg:text-center m-4 text-xl sm:text-2xl font-semibold pl-3 sm:pl-[3rem] w-full">
              You Might Like
            </h2>
            <div className="flex justify-center items-center gap-3 w-full">
              <MdOutlineKeyboardArrowLeft
                className="text-3xl hover:scale-125 transition-all duration-200 ease-in-out cursor-pointer h-[9rem] arrow-btn hidden lg:block"
                onClick={() => scrollLeft(scrollRef)}
              />
              <div
                className="grid grid-rows-1 grid-flow-col justify-start overflow-x-scroll scroll-hide items-center gap-3 lg:gap-2 w-full px-3 lg:px-0 scroll-smooth"
                ref={scrollRef}
              >
                {suggetions.map((song, index) => (
                  <SongGrid key={song.id || index} {...song} song={list} />
                ))}
              </div>
              <MdOutlineKeyboardArrowRight
                className="text-3xl hover:scale-125 transition-all duration-200 ease-in-out cursor-pointer h-[9rem] arrow-btn hidden lg:block"
                onClick={() => scrollRight(scrollRef)}
              />
            </div>
          </div>
        )}

        {/* Similar Albums */}
        {similarAlbums.length > 0 && (
          <div className="w-full mb-6">
            <h2 className="m-4 mt-0 text-xl lg:text-2xl font-semibold w-full ml-[1rem] lg:ml-[3rem]">
              Similar Albums
            </h2>
            <AlbumSlider albums={similarAlbums} />
          </div>
        )}

        {/* Artists in this Album */}
        {albumArtists.length > 0 && (
          <div className="w-full mb-[5rem]">
            <h2 className="m-4 mt-0 text-xl lg:text-2xl font-semibold w-full ml-[1rem] lg:ml-[3.5rem]">
              Artists in this Album
            </h2>
            <ArtistSlider artists={albumArtists} />
          </div>
        )}
      </div>

      <Player />
      <Navigator />
      <Footer />
    </>
  );
};

export default AlbumDetail;
