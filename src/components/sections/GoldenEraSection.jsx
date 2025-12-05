// src/components/sections/GoldenEraSection.jsx
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import he from "he";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import { goldenEraPlaylists } from "../../data/goldenEraData";

const GoldenEraSection = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollLeft -= 800;
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollLeft += 800;
  };

  const handleClick = (playlist) => {
    navigate(`/playlists/${playlist.id}`);
  };

  return (
    <section className="mt-8">
      {/* Heading row */}
      <div className="flex items-center justify-between px-4 lg:px-16 mb-3">
        <h2 className="text-2xl font-semibold">
          Golden Era • Bollywood Classics
        </h2>
      </div>

      {/* Slider row – YT Music jaisa */}
      <div className="flex items-center gap-2">
        {/* Left arrow (sirf large screen) */}
        <MdOutlineKeyboardArrowLeft
          className="hidden lg:block text-3xl w-8 h-[8rem] cursor-pointer arrow-btn hover:scale-125 transition-transform"
          onClick={scrollLeft}
        />

        <div
          ref={scrollRef}
          className="
            grid grid-rows-1 grid-flow-col
            gap-3 lg:gap-4
            w-full
            px-4 lg:px-0
            overflow-x-scroll scroll-hide scroll-smooth
          "
        >
          {goldenEraPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => handleClick(playlist)}
              className="
                card
                w-[11rem] lg:w-[13rem]
                rounded-2xl
                overflow-hidden
                cursor-pointer
                bg-groovia-card
                border border-groovia-border
                hover:border-groovia-accent
                hover:-translate-y-1
                hover:shadow-groovia
                transition-all duration-300
              "
            >
              {/* Cover – big square image */}
              <div className="relative w-full aspect-square overflow-hidden">
                <img
                  src={playlist.image?.[2]?.url || playlist.image?.[1]?.url}
                  alt={playlist.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Text – exactly YT vibe: title + "Playlist · x songs" */}
              <div className="px-2 pt-2 pb-3 flex flex-col gap-1">
                <p className="font-semibold text-sm lg:text-base truncate">
                  {playlist.name ? he.decode(playlist.name) : "Empty"}
                </p>
                <p className="text-[11px] lg:text-xs text-gray-400 truncate">
                  Playlist · {playlist.songCount ?? 0} songs
                </p>
                {playlist.tagLine && (
                  <p className="text-[10px] lg:text-[11px] text-gray-500 truncate">
                    {playlist.tagLine}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <MdOutlineKeyboardArrowRight
          className="hidden lg:block text-3xl w-8 h-[8rem] cursor-pointer arrow-btn hover:scale-125 transition-transform"
          onClick={scrollRight}
        />
      </div>
    </section>
  );
};

export default GoldenEraSection;
