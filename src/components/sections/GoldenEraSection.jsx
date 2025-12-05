// src/components/sections/GoldenEraSection.jsx
import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import he from "he";
import { goldenEraPlaylists } from "../../data/goldenEraData";

const GoldenEraSection = () => {
  const scrollRef = useRef(null);

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

  if (!goldenEraPlaylists?.length) return null;

  return (
    <div className="w-full mt-4">
      {/* Section title */}

      <h2 className="m-4 mt-0 text-xl lg:text-2xl font-semibold w-full ml-[1rem] lg:ml-[3.5rem]">
        Golden Era Classics
      </h2>

      {/* Slider wrapper */}
      <div className="flex justify-center items-center gap-3 w-full">
        {/* Left arrow (desktop only) */}
        <MdOutlineKeyboardArrowLeft
          className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
          onClick={scrollLeft}
        />

        {/* Scrollable area */}
        <div className="w-full px-3 lg:px-0 overflow-hidden">
          <div
            ref={scrollRef}
            className="
              grid grid-rows-1 grid-flow-col
              gap-3 lg:gap-4
              overflow-x-auto scroll-hide scroll-smooth
            "
          >
            {goldenEraPlaylists.map((pl) => {
              const imageUrl =
                pl.image?.[2]?.url || pl.image?.[1]?.url || pl.image?.[0]?.url;

              return (
                <Link
                  key={pl.id}
                  to={`/playlists/${pl.id}`}
                  className="
                    card
                    w-[11rem] lg:w-[13rem]
                    flex-shrink-0
                    rounded-2xl overflow-hidden
                    bg-groovia-card hover:bg-groovia-card/90
                    hover:shadow-groovia
                    transition-all duration-200
                  "
                >
                  {/* Cover image – square card (YT Music style) */}
                  <div className="w-full aspect-square overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={pl.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Text area */}
                  <div className="px-3 py-3 flex flex-col gap-1">
                    <h3 className="font-semibold text-sm truncate">
                      {he.decode(pl.name)}
                    </h3>

                    <p className="text-xs text-gray-400 truncate">
                      {pl.tagLine ? he.decode(pl.tagLine) : "Playlist"}
                    </p>

                    <p className="text-[11px] text-gray-500">
                      Playlist • {pl.songCount} songs
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right arrow (desktop only) */}
        <MdOutlineKeyboardArrowRight
          className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
          onClick={scrollRight}
        />
      </div>
    </div>
  );
};

export default GoldenEraSection;
