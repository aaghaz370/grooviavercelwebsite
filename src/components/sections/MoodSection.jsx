// src/components/sections/MoodSection.jsx
import { useRef } from "react";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import { moodPlaylists } from "../../data/moodPlaylistsData";
import MoodPlaylistCard from "../MoodPlaylistCard";

const MoodSection = () => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= 500;
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 500;
    }
  };

  if (!moodPlaylists || moodPlaylists.length === 0) return null;

  return (
    <div className="w-full mt-2">
      <div className="flex items-center justify-between px-4 lg:px-[3.5rem] mb-3">
        <h2 className="text-xl lg:text-2xl font-semibold">
          For Every Mood
        </h2>
        {/* future me chahe to "Play all" button dal sakte ho */}
      </div>

      <div className="flex items-center gap-2 w-full">
        {/* Left arrow (desktop only) */}
        <MdOutlineKeyboardArrowLeft
          className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
          onClick={scrollLeft}
        />

        {/* Scrollable container */}
        <div className="w-full overflow-x-auto scroll-hide px-3 lg:px-0">
          <div
            ref={scrollRef}
            className="
              flex 
              gap-3 lg:gap-4 
              scroll-smooth
            "
          >
            {moodPlaylists.map((playlist) => (
              <MoodPlaylistCard key={playlist.id} {...playlist} />
            ))}
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

export default MoodSection;
