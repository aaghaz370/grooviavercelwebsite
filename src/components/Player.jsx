// src/components/Player.jsx
import { useContext, useRef, useState, useEffect } from "react";
import { IoIosClose, IoMdSkipBackward, IoMdSkipForward } from "react-icons/io";
import { IoShareSocial } from "react-icons/io5";
import { PiShuffleBold } from "react-icons/pi";
import { LuRepeat, LuRepeat1 } from "react-icons/lu";
import { FaPlay, FaPause, FaHeart, FaRegHeart } from "react-icons/fa";
import {
  MdDownload,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { CiMaximize1 } from "react-icons/ci";
import { PiSpeakerLowFill } from "react-icons/pi";
import MusicContext from "../context/MusicContext";
import ArtistItems from "./Items/ArtistItems";
import he from "he";
import { getSongById, getSuggestionSong } from "../../fetch";
import SongGrid from "./SongGrid";
import { Link } from "react-router";

const Player = () => {
  const {
    currentSong,
    song,
    playMusic,
    isPlaying,
    shuffle,
    nextSong,
    prevSong,
    toggleShuffle,
    repeatMode,
    toggleRepeatMode,
    downloadSong,
    // 💤 SLEEP TIMER from context
    sleepTimerMinutes,
    setSleepTimer,
  } = useContext(MusicContext);

  const [volume, setVolume] = useState(() => {
    return Number(localStorage.getItem("volume")) || 100;
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isMaximized, setisMaximized] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const [detail, setDetails] = useState(null);
  const [list, setList] = useState({});
  const [suggetions, setSuggetion] = useState([]);
  const [likedSongs, setLikedSongs] = useState(() => {
    return JSON.parse(localStorage.getItem("likedSongs")) || [];
  });

  // ⭐ NEW: queue / play-next
  const [upNext, setUpNext] = useState([]);

  // ⭐ NEW: custom sleep timer UI state
  const [showCustomTimer, setShowCustomTimer] = useState(false);
  const [customHours, setCustomHours] = useState("");

  // ---- FULLSCREEN STATE (for home footer hide/show) ----
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      document.body.classList.toggle("fullscreen-active", active);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error", err);
    }
  };
  // ------------------------------------------------------

  const inputRef = useRef();

  // You Might Like horizontal scroll
  const scrollRef = useRef(null);

  // ⭐ NEW: Play Next horizontal scroll
  const queueScrollRef = useRef(null);

  const scrollLeft = (ref) => {
    if (ref.current) {
      ref.current.scrollLeft -= 1000;
    }
  };
  const scrollRight = (ref) => {
    if (ref.current) {
      ref.current.scrollLeft += 1000;
    }
  };

  // ----- SWIPE FOR NEXT/PREV (sirf top player area) -----
  const swipeStartX = useRef(null);
  const swipeStartY = useRef(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const swipeAreaRef = useRef(null);

  const handleSwipeStart = (e) => {
    if (!currentSong) return;
    const touch = e.touches[0];
    swipeStartX.current = touch.clientX;
    swipeStartY.current = touch.clientY;
    setSwipeOffset(0);
  };

  const handleSwipeMove = (e) => {
    if (swipeStartX.current == null || swipeStartY.current == null) return;

    const touch = e.touches[0];
    const dx = touch.clientX - swipeStartX.current;
    const dy = touch.clientY - swipeStartY.current;

    if (Math.abs(dy) > Math.abs(dx)) return;

    e.preventDefault();
    setSwipeOffset(dx);
  };

  const handleSwipeEnd = () => {
    if (swipeStartX.current == null) {
      setSwipeOffset(0);
      return;
    }

    const delta = swipeOffset;
    const width =
      swipeAreaRef.current?.offsetWidth || window.innerWidth || 300;
    const threshold = width * 0.3;

    if (Math.abs(delta) > threshold) {
      const goingNext = delta < 0;

      setSwipeOffset(goingNext ? -width : width);

      setTimeout(() => {
        if (goingNext) {
          nextSong();
        } else {
          prevSong();
        }
        setSwipeOffset(0);
      }, 120);
    } else {
      setSwipeOffset(0);
    }

    swipeStartX.current = null;
    swipeStartY.current = null;
  };
  // ----- END SWIPE -----

  useEffect(() => {
    if (!currentSong) return;

    const audio = currentSong?.audio;
    setCurrentTime(audio.currentTime);

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      const progress =
        (audio.currentTime / Number(currentSong?.duration)) * 100;
      if (inputRef.current) {
        inputRef.current.style.setProperty("--progress", `${progress}%`);
      }
    };

    audio.addEventListener("timeupdate", updateProgress);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, [currentSong, isPlaying]);

  useEffect(() => {
    setIsVisible(!!(currentSong || isPlaying));
  }, [currentSong, isPlaying]);

  const artistNames = currentSong?.artists?.primary
    ? currentSong.artists.primary.map((artist) => artist.name).join(", ")
    : "Unknown Artist";

  // song -> album detail
  useEffect(() => {
    const albumDetail = async () => {
      const result = await getSongById(currentSong.id);
      setDetails(result?.data?.[0] || null);
    };
    if (currentSong?.id) {
      albumDetail();
    }
  }, [currentSong]);

  // suggestions + volume + ended
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!currentSong?.id) return;
      const suggestions = await getSuggestionSong(currentSong.id);
      const data = suggestions?.data || [];
      setList(data);
      setSuggetion(data);
    };

    fetchSuggestions();

    if (currentSong) {
      const audioElement = currentSong.audio;
      audioElement.volume = volume / 100;

      const handleTimeUpdate = () => {
        setCurrentTime(audioElement.currentTime);
        const duration = Number(currentSong.duration);
        const newTiming = (audioElement.currentTime / duration) * 100;
        if (inputRef.current) {
          inputRef.current.value = newTiming;
        }
      };

      const handleEndSong = () => {
        if (!currentSong || !currentSong.id) return;
        nextSong();
      };

      audioElement.addEventListener("timeupdate", handleTimeUpdate);
      audioElement.addEventListener("ended", handleEndSong);

      return () => {
        audioElement.removeEventListener("timeupdate", handleTimeUpdate);
        audioElement.removeEventListener("ended", handleEndSong);
      };
    }
  }, [currentSong, volume, nextSong]);

  const handleProgressChange = (event) => {
    const newPercentage = parseFloat(event.target.value);
    const newTime = (newPercentage / 100) * Number(currentSong.duration);
    currentSong.audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value) / 100;
    setVolume(newVolume * 100);
    localStorage.setItem("volume", newVolume * 100);
    if (currentSong?.audio) {
      currentSong.audio.volume = newVolume;
    }
  };

  const handleMaximized = () => {
    setisMaximized(!isMaximized);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const toggleLikeSong = () => {
    if (!currentSong) return;

    const songData = {
      id: currentSong.id,
      name: currentSong.name,
      audio: currentSong.audio.currentSrc,
      duration: currentSong.duration,
      image: currentSong.image,
      artists: currentSong.artists,
    };

    const updatedLikedSongs = likedSongs.some(
      (song) => song.id === currentSong.id
    )
      ? likedSongs.filter((song) => song.id !== currentSong.id)
      : [...likedSongs, songData];

    setLikedSongs(updatedLikedSongs);
    localStorage.setItem("likedSongs", JSON.stringify(updatedLikedSongs));
  };

  const name = currentSong?.name || "Unknown Title";

  useEffect(() => {
    if (!currentSong) return;

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: he.decode(name),
        artist: he.decode(artistNames),
        album: "Musify",
        artwork: [
          {
            src: currentSong?.image || "/Unknown.png",
            sizes: "500x500",
            type: "image/png",
          },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        playMusic(
          currentSong?.audio.currentSrc,
          currentSong?.name,
          currentSong?.duration,
          currentSong?.image,
          currentSong?.id,
          song
        );
      });

      navigator.mediaSession.setActionHandler("pause", () => {
        playMusic(
          currentSong?.audio.currentSrc,
          currentSong?.name,
          currentSong?.duration,
          currentSong?.image,
          currentSong?.id,
          song
        );
      });

      navigator.mediaSession.setActionHandler("previoustrack", prevSong);
      navigator.mediaSession.setActionHandler("nexttrack", nextSong);
    }
  }, [currentSong, artistNames, playMusic, prevSong, nextSong, song, name]);

  const theme = document.documentElement.getAttribute("data-theme");

  if (currentSong) {
    currentSong.audio.loop = repeatMode === "one";
  }

  const albumId = detail?.album?.id;
  const albumName = detail?.album?.name || "";

  // ⭐ Sleep timer preset buttons
  const sleepOptions = [
    { label: "Off", value: null },
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "60 min", value: 60 },
  ];

  // ⭐ Calculate Play Next queue from currentSong + song[]
  useEffect(() => {
    if (!currentSong || !Array.isArray(song) || !song.length) {
      setUpNext([]);
      return;
    }

    const idx = song.findIndex((s) => s.id === currentSong.id);
    if (idx === -1) {
      setUpNext([]);
      return;
    }

    const nextItems = song.slice(idx + 1, idx + 11);
    setUpNext(nextItems);
  }, [currentSong, song]);

  // ⭐ Custom sleep timer apply
  const handleCustomSleepApply = () => {
    const hrs = parseFloat(customHours);
    if (!hrs || hrs <= 0) return;

    const clamped = Math.min(hrs, 12);
    const minutes = Math.round(clamped * 60);

    setSleepTimer(minutes);
    setShowCustomTimer(false);
  };

  const formatSleepLabel = (mins) => {
    if (!mins || mins <= 0) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h && m) return `${h} hr ${m} min`;
    if (h) return `${h} hr`;
    return `${m} min`;
  };

  return (
    <div
      className={` ${
        isVisible ? "lg:flex " : "hidden"
      } fixed bottom-14 lg:bottom-0 left-0 w-screen z-20 flex justify-center items-center`}
    >
      <div
        className={`flex flex-col w-screen bg-auto rounded-tl-xl rounded-tr-xl relative transition-all ease-in-out duration-500 ${
          isMaximized
            ? "pt-[26rem] backdrop-brightness-[0.4]"
            : "lg:h-[5.4rem] px-4 py-2 Player"
        }`}
      >
        <div className="flex flex-col w-full ">
          {/* MINIMIZED VIEW */}
          {!isMaximized && currentSong && (
            <>
              <form className="flex items-center w-full lg:mb-2 mb-1 gap-3 h-[10px] ">
                <span className=" text-xs ">{formatTime(currentTime)} </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step="0.1"
                  ref={inputRef}
                  value={
                    currentSong?.audio?.currentTime
                      ? (currentTime / Number(currentSong.duration)) * 100
                      : 0
                  }
                  style={{
                    background: `linear-gradient(to right, ${
                      theme === "dark" ? "#ddd" : "#09090B"
                    } ${
                      (currentTime / Number(currentSong?.duration)) * 100
                    }%, ${theme === "dark" ? "#252525" : "#dddddd"} ${
                      (currentTime / Number(currentSong?.duration)) * 100
                    }%)`,
                  }}
                  onChange={handleProgressChange}
                  className="range"
                />
                <span className=" text-xs">
                  {formatTime(currentSong?.duration || 0)}
                </span>
              </form>
              <div className=" h-[3rem] w-full">
                <div className="flex justify-between items-center  ">
                  <div
                    className="flex w-full  lg:w-auto"
                    onClick={handleMaximized}
                  >
                    <div className=" flex items-center gap-3 ">
                      <img
                        src={currentSong?.image || " "}
                        alt={currentSong?.name || ""}
                        className="rounded w-10 lg:w-14"
                      />
                      <div className="flex flex-col overflow-y-clip p-1 w-[14rem] h-[2.9rem]">
                        <span className=" w-fit h-[1.5rem] overflow-hidden">
                          {currentSong?.name
                            ? he.decode(currentSong.name)
                            : "Empty"}
                        </span>

                        <span className="text-xs h-1 ">
                          {he.decode(artistNames)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col lg:items-center gap-5   p-2">
                    <div className="flex gap-5 justify-end lg:justify-center items-center">
                      {repeatMode === "none" ? (
                        <LuRepeat
                          className={` text-2xl hidden lg:block cursor-pointer hover:text-[#ff3448] `}
                          onClick={toggleRepeatMode}
                          title={`Repeat Mode: ${
                            repeatMode === "none" ? "none" : "one"
                          }`}
                        />
                      ) : (
                        <LuRepeat1
                          className={
                            " text-2xl hidden lg:block cursor-pointer text-[#ff3448]"
                          }
                          onClick={toggleRepeatMode}
                          title={`Repeat Mode: ${
                            repeatMode === "none" ? "none" : "one"
                          }`}
                        />
                      )}
                      <IoMdSkipBackward
                        className="icon hidden lg:block hover:scale-110 text-2xl cursor-pointer"
                        onClick={prevSong}
                      />
                      <div className=" rounded-full p-2">
                        {isPlaying ? (
                          <FaPause
                            className="  p-[0.1rem] icon hover:scale-110 text-xl lg:text-2xl cursor-pointer"
                            onClick={() =>
                              playMusic(
                                currentSong?.audio.currentSrc,
                                currentSong?.name,
                                currentSong?.duration,
                                currentSong?.image,
                                currentSong?.id,
                                song
                              )
                            }
                          />
                        ) : (
                          <FaPlay
                            className=" icon p-[0.1rem] hover:scale-110 text-xl lg:text-2xl cursor-pointer"
                            onClick={() =>
                              playMusic(
                                currentSong?.audio.currentSrc,
                                currentSong?.name,
                                currentSong?.duration,
                                currentSong?.image,
                                currentSong?.id,
                                song
                              )
                            }
                          />
                        )}
                      </div>
                      <IoMdSkipForward
                        className="icon hidden lg:block hover:scale-110 text-2xl cursor-pointer"
                        onClick={nextSong}
                      />
                      <PiShuffleBold
                        className={` hidden lg:block hover:text-[#fd3a4e] text-2xl cursor-pointer ${
                          shuffle ? "text-[#fd3a4e]" : ""
                        }`}
                        onClick={toggleShuffle}
                      />
                    </div>
                  </div>

                  <div className="lg:flex hidden  items-center gap-5 justify-end">
                    <button onClick={toggleLikeSong} title="Like Song">
                      {likedSongs.some(
                        (song) => song.id === currentSong?.id
                      ) ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart className="icon" />
                      )}
                    </button>
                    <MdDownload
                      className="hover:text-[#fd3a4e] icon  text-2xl cursor-pointer"
                      onClick={downloadSong}
                      title="Download Song"
                    />
                    <div className="items-center gap-1 flex ">
                      <PiSpeakerLowFill className="text-xl" />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={volume}
                        onChange={handleVolumeChange}
                        className="volume icon rounded-lg appearance-none cursor-pointer w-[80px] h-1"
                        style={{
                          background: `linear-gradient(to right, ${
                            theme === "dark" ? "#ddd" : "#09090B"
                          } ${volume}%, ${
                            theme === "dark" ? "#252525" : "#dddddd"
                          } ${volume}%)`,
                        }}
                        title="Volume"
                      />
                    </div>
                    <div className="flex">
                      <CiMaximize1
                        title="Maximize"
                        className="icon p-1 text-2xl rounded icon cursor-pointer"
                        onClick={handleMaximized}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* MAXIMIZED VIEW */}
          {isMaximized && currentSong && (
            <>
              <div className="flex w-full bottom-0 flex-col p-2 pt-2 lg:h-[40rem] h-[45rem] gap-4 scroll-hide overflow-y-scroll rounded-tl-2xl rounded-tr-2xl Player scroll-smooth">
                <div className=" flex w-[97%] justify-end ">
                  <IoIosClose
                    className="  icon text-[3rem] cursor-pointer"
                    onClick={handleMaximized}
                  />
                </div>
                <div className=" ">
                  {/* SWIPE AREA only on this top block */}
                  <div
                    ref={swipeAreaRef}
                    onTouchStart={handleSwipeStart}
                    onTouchMove={handleSwipeMove}
                    onTouchEnd={handleSwipeEnd}
                    className="flex lg:flex-row flex-col transform-gpu transition-transform duration-200"
                    style={{ transform: `translateX(${swipeOffset}px)` }}
                  >
                    <div className=" flex  justify-center items-center lg:pl-[2.5rem]">
                      <img
                        src={currentSong?.image || " "}
                        className=" h-[22rem] lg:h-[17rem]  rounded-lg object-cover shadow-2xl profile"
                      />
                    </div>

                    <div className="flex flex-col justify-center lg:w-[70%] lg:pl-5 p-1  gap-4">
                      <div className="flex  flex-col  gap-[0.5rem] mt-5 lg:ml-1 ml-[1.5rem]">
                        <span className=" text-2xl font-semibold h-auto  justify-between  flex  overflow-clip  ">
                          {currentSong?.name
                            ? he.decode(currentSong.name)
                            : "Empty"}
                        </span>
                        <span className="overflow-hidden  flex  w-[98%] mb-1  text-base font-medium  justify-between h-[1.84rem]      ">
                          {he.decode(artistNames)}
                          <span className="flex gap-3 justify-center place-items-center ">
                            <button
                              onClick={toggleLikeSong}
                              title="Like Song"
                              className=" "
                            >
                              {likedSongs.some(
                                (song) => song.id === currentSong?.id
                              ) ? (
                                <FaHeart className="text-red-500 text-2xl" />
                              ) : (
                                <FaRegHeart className="icon text-2xl hover:text-red-500" />
                              )}
                            </button>
                            <MdDownload
                              className="lg:hover:text-[#fd3a4e] active:text-[#fd3a4e]  flex self-center text-[1.8rem] cursor-pointer icon"
                              onClick={downloadSong}
                              title="Download Song"
                            />
                          </span>
                        </span>
                      </div>
                      <form className="flex items-center w-full gap-3 h-[0px]">
                        <span className="lg:hidden block  text-xs ">
                          {formatTime(currentTime)}{" "}
                        </span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step="0.1"
                          ref={inputRef}
                          value={
                            currentSong?.audio?.currentTime
                              ? (currentTime / Number(currentSong.duration)) *
                                100
                              : 0
                          }
                          style={{
                            background: `linear-gradient(to right, ${
                              theme === "dark" ? "#ddd" : "#252525"
                            } ${
                              (currentTime / Number(currentSong?.duration)) *
                              100
                            }%, ${theme === "dark" ? "#252525" : "#dddddd"} ${
                              (currentTime / Number(currentSong?.duration)) *
                              100
                            }%)`,
                          }}
                          onChange={handleProgressChange}
                          className="range"
                        />
                        <span className="lg:hidden block  text-xs">
                          {formatTime(currentSong?.duration || 0)}
                        </span>
                      </form>
                      <div className="flex flex-col items-center ">
                        <div className="flex items-center justify-end lg:w-full lg:gap-[20rem] gap-[0.5rem] ">
                          <div className="flex  items-center gap-5 p-8 w-full lg:w-[36%] justify-end ">
                            {repeatMode === "none" ? (
                              <LuRepeat
                                className={` text-2xl  cursor-pointer lg:hover:text-[#ff3448] `}
                                onClick={toggleRepeatMode}
                                title={`Repeat Mode: ${
                                  repeatMode === "none" ? "none" : "one"
                                }`}
                              />
                            ) : (
                              <LuRepeat1
                                className={
                                  " text-2xl cursor-pointer text-[#ff3448]"
                                }
                                onClick={toggleRepeatMode}
                                title={`Repeat Mode: ${
                                  repeatMode === "none" ? "none" : "one"
                                }`}
                              />
                            )}
                            <IoMdSkipBackward
                              className="icon lg:hover:scale-110 text-3xl cursor-pointer"
                              onClick={prevSong}
                            />
                            <div>
                              {isPlaying ? (
                                <FaPause
                                  className="p-[0.1rem] icon lg:hover:scale-110 text-3xl cursor-pointer"
                                  onClick={() =>
                                    playMusic(
                                      currentSong?.audio.currentSrc,
                                      currentSong?.name,
                                      currentSong?.duration,
                                      currentSong?.image,
                                      currentSong?.id,
                                      song
                                    )
                                  }
                                />
                              ) : (
                                <FaPlay
                                  className=" icon p-[0.1rem] lg:hover:scale-110 text-3xl cursor-pointer"
                                  onClick={() =>
                                    playMusic(
                                      currentSong?.audio.currentSrc,
                                      currentSong?.name,
                                      currentSong?.duration,
                                      currentSong?.image,
                                      currentSong?.id,
                                      song
                                    )
                                  }
                                />
                              )}
                            </div>
                            <IoMdSkipForward
                              className="icon lg:hover:scale-110 text-3xl cursor-pointer"
                              onClick={nextSong}
                            />
                            <PiShuffleBold
                              className={` text-3xl cursor-pointer  lg:hover:text-[#fd3a4e] ${
                                shuffle ? " text-[#fd3a4e] " : ""
                              }`}
                              onClick={toggleShuffle}
                            />
                          </div>

                          {albumId && (
                            <IoShareSocial
                              className="icon text-3xl hidden lg:block cursor-pointer  lg:hover:scale-105 mr-4 "
                              onClick={() =>
                                navigator.share({
                                  title: currentSong.name,
                                  text: `Listen to ${currentSong.name} on Musify`,
                                  url: `${window.location.origin}/albums/${albumId}`,
                                })
                              }
                            />
                          )}
                        </div>

                        {/* 💤 SLEEP TIMER CONTROLS (MAX VIEW) */}
                        <div className="flex flex-col items-center mt-1 mb-2">
                          <div className="flex flex-wrap items-center gap-2 text-[0.7rem] opacity-80 justify-center">
                            <span className="uppercase tracking-[0.16em] text-[0.6rem] opacity-70">
                              Sleep timer
                            </span>
                            {sleepOptions.map((opt) => (
                              <button
                                key={opt.label}
                                onClick={() => setSleepTimer(opt.value)}
                                className={`px-3 py-1 rounded-full border text-[0.65rem] transition ${
                                  (opt.value === null && !sleepTimerMinutes) ||
                                  sleepTimerMinutes === opt.value
                                    ? "bg-white text-black border-white"
                                    : "bg-white/5 border-white/20 hover:bg-white/10"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                            <button
                              onClick={() =>
                                setShowCustomTimer((prev) => !prev)
                              }
                              className={`px-3 py-1 rounded-full border text-[0.65rem] transition ${
                                showCustomTimer
                                  ? "bg-white text-black border-white"
                                  : "bg-white/5 border-white/20 hover:bg-white/10"
                              }`}
                            >
                              Custom
                            </button>
                          </div>

                          {showCustomTimer && (
                            <div className="flex items-center gap-2 mt-2 text-[0.7rem]">
                              <input
                                type="number"
                                min="0.25"
                                max="12"
                                step="0.25"
                                value={customHours}
                                onChange={(e) => setCustomHours(e.target.value)}
                                className="w-16 px-2 py-1 rounded-lg bg-black/40 border border-white/20 text-center text-[0.7rem] outline-none"
                                placeholder="1.0"
                              />
                              <span>hr</span>
                              <button
                                onClick={handleCustomSleepApply}
                                className="px-3 py-1 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 text-[0.7rem]"
                              >
                                Set
                              </button>
                            </div>
                          )}

                          {sleepTimerMinutes && (
                            <span className="mt-1 text-[0.65rem] opacity-60">
                              Will stop after ~{formatSleepLabel(
                                sleepTimerMinutes
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LOWER CONTENT (no swipe here) */}
                  <div className="flex flex-col overflow-hidden  p-1">
                    {/* ⭐ PLAY NEXT / QUEUE SECTION */}
                    {Array.isArray(upNext) && upNext.length > 0 && (
                      <div className="flex flex-col justify-center items-center w-full ">
                        <div className="flex flex-col w-full px-6 lg:px-16">
                          <h2 className="text-xl lg:text-2xl font-semibold">
                            Play Next
                          </h2>
                          <p className="text-[0.7rem] opacity-70 mt-1">
                            Upcoming tracks in your queue • Tap any song to jump
                            instantly.
                          </p>
                        </div>
                        <div className="flex justify-center items-center gap-3 w-full mt-2">
                          <MdOutlineKeyboardArrowLeft
                            className="text-3xl hover:scale-125 cursor-pointer h-[9rem]   hidden lg:block arrow-btn"
                            onClick={() => scrollLeft(queueScrollRef)}
                          />
                          <div
                            className="grid grid-rows-2 lg:grid-rows-1 grid-flow-col justify-start overflow-x-scroll scroll-hide items-center gap-3 lg:gap-[.35rem] w-full  px-3 lg:px-0 scroll-smooth"
                            ref={queueScrollRef}
                          >
                            {upNext.map((qSong, index) => (
                              <SongGrid
                                key={qSong.id || index}
                                {...qSong}
                                song={song}
                              />
                            ))}
                          </div>
                          <MdOutlineKeyboardArrowRight
                            className="text-3xl hover:scale-125  cursor-pointer h-[9rem] hidden lg:block arrow-btn"
                            onClick={() => scrollRight(queueScrollRef)}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      {Array.isArray(suggetions) && suggetions.length > 0 && (
                        <div className="flex flex-col justify-center items-center w-full ">
                          <h2 className="pr-1 m-4 text-xl lg:text-2xl font-semibold w-full ml-[2.5rem] lg:ml-[5.5rem] ">
                            You Might Like
                          </h2>
                          <div className="flex justify-center items-center gap-3 w-full">
                            <MdOutlineKeyboardArrowLeft
                              className="text-3xl hover:scale-125 cursor-pointer h-[9rem]   hidden lg:block arrow-btn"
                              onClick={() => scrollLeft(scrollRef)}
                            />
                            <div
                              className="grid grid-rows-2 lg:grid-rows-1 grid-flow-col justify-start overflow-x-scroll scroll-hide items-center gap-3 lg:gap-[.35rem] w-full  px-3 lg:px-0 scroll-smooth"
                              ref={scrollRef}
                            >
                              {suggetions.map((songItem, index) => (
                                <SongGrid
                                  key={songItem.id || index}
                                  {...songItem}
                                  song={list}
                                />
                              ))}
                            </div>
                            <MdOutlineKeyboardArrowRight
                              className="text-3xl hover:scale-125  cursor-pointer h-[9rem] hidden lg:block arrow-btn"
                              onClick={() => scrollRight(scrollRef)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col pt-3 ">
                      <h2 className="pr-1 text-xl lg:text-2xl font-semibold  w-full ml-[2rem] lg:ml-[3.5rem] lg:m-3 ">
                        Artists
                      </h2>
                      <div className="grid grid-flow-col lg:w-max w-full scroll-smooth gap-[1rem] lg:gap-[1.5rem] lg:pl-[2rem] pl-[1rem] overflow-x-scroll scroll-hide ">
                        {currentSong?.artists?.primary?.map((artist, index) => (
                          <ArtistItems
                            key={`${artist.id || index}`}
                            {...artist}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-[2rem] ">
                      {albumId && (
                        <div className="flex flex-col ">
                          <h2 className="pr-1 text-xl lg:text-2xl font-semibold  w-full ml-[2rem] lg:ml-[3.5rem] ">
                            From Album ...
                          </h2>
                          <Link
                            to={`/albums/${albumId}`}
                            className="card  w-[12.5rem] h-fit overflow-clip  border-[0.1px]  p-1  rounded-lg lg:mx-[2rem] mt-[1rem] "
                          >
                            <div className="p-1">
                              <img
                                src={currentSong.image || "/Unknown.png"}
                                alt={name}
                                className="rounded-lg "
                              />
                            </div>
                            <div className="w-full flex flex-col justify-center pl-2">
                              <span className="font-semibold text-[1.1rem] overflow-x-clip ">
                                {albumName ? he.decode(albumName) : ""}
                              </span>
                            </div>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* MAX PLAYER BOTTOM – logo + fullscreen button */}
                    <div className="flex flex-col items-center justify-center mt-6 mb-4 gap-2">
                      <div className="flex items-center gap-1">
                        <span className="bg"></span>
                        <span className="Musi font-extrabold text-xl">
                          Groo
                        </span>
                        <span className="fy font-extrabold text-xl">via</span>
                      </div>
                      <p className="text-xs">Made with ❤️ by Rolex Sir.</p>
                      <button
                        onClick={toggleFullscreen}
                        className="mt-1 px-4 py-1.5 text-xs rounded-full border border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm flex items-center gap-2"
                      >
                        {isFullscreen ? "Exit full screen" : "Go full screen"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Player;
