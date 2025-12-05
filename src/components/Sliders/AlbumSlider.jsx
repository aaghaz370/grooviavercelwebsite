import { MdOutlineKeyboardArrowRight, MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { useRef } from "react";
import AlbumItems from "../Items/AlbumItems";

const AlbumSlider = ({ albums }) => {
  const scrollRef = useRef(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= 800; // Har click pe approx ek card ka slide
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += 800;
    }
  };

  return (
    <div className="flex justify-center items-center gap-3">
      {/* Left Arrow */}
      <MdOutlineKeyboardArrowLeft
        className="text-3xl w-[2rem] hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer h-[9rem] hidden lg:block arrow-btn"
        onClick={scrollLeft}
      />

      {/* Horizontal big cards – YT Music Fresh style */}
      <div
        className="grid overflow-x-scroll scroll-hide scroll-smooth w-full px-3 lg:px-0 gap-4"
        ref={scrollRef}
        style={{
          gridAutoFlow: "column",
          gridAutoColumns: "85%", // mobile pe 1 card full
        }}
      >
        {albums?.map((album) => (
          <AlbumItems
            key={album.id}
            {...album}
          />
        ))}
      </div>

      {/* Right Arrow */}
      <MdOutlineKeyboardArrowRight
        className="text-3xl w-[2rem] hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer h-[9rem] hidden lg:block arrow-btn"
        onClick={scrollRight}
      />
    </div>
  );
};

export default AlbumSlider;
