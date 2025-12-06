// src/components/sections/CommunitySection.jsx
import { useEffect, useRef, useState } from "react";
import { fetchplaylistsByID } from "../../../fetch";
import { communityPlaylists } from "../../communityPlaylistsData";
import CommunityPlaylistCard from "../CommunityPlaylistCard";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

const CommunitySection = () => {
  const [playlistsData, setPlaylistsData] = useState({});
  const scrollRef = useRef(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const results = await Promise.all(
          communityPlaylists.map(async (cfg) => {
            const res = await fetchplaylistsByID(cfg.id);
            return [cfg.id, res.data]; // res.data.songs etc.
          })
        );

        const map = {};
        results.forEach(([id, data]) => {
          map[id] = data;
        });
        setPlaylistsData(map);
      } catch (err) {
        console.error("Community playlists fetch error:", err);
      }
    };

    loadAll();
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollLeft -= 800;
  };

  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollLeft += 800;
  };

  if (!communityPlaylists.length) return null;

  return (
    <div className="flex flex-col w-full mt-2">
      <h2 className="m-4 mt-2 text-xl lg:text-2xl font-semibold w-full lg:ml-[3.5rem] ml-[1rem]">
        From the Community
      </h2>

      <div className="flex justify-center items-center gap-2 w-full">
        <MdOutlineKeyboardArrowLeft
          className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
          onClick={scrollLeft}
        />

        <div className="w-full overflow-hidden pl-2 lg:pl-0">
          <div
  ref={scrollRef}
  className="
    grid
    grid-rows-1
    grid-flow-col
    gap-3 lg:gap-4
    overflow-x-auto
    overflow-y-hidden    /* 👈 yaha naya */
    scroll-hide
    scroll-smooth
    pr-3
  "
>
            {communityPlaylists.map((cfg) => (
              <CommunityPlaylistCard
                key={cfg.id}
                config={cfg}
                playlistData={playlistsData[cfg.id]}
              />
            ))}
          </div>
        </div>

        <MdOutlineKeyboardArrowRight
          className="text-3xl hover:scale-125 cursor-pointer arrow-btn hidden lg:block"
          onClick={scrollRight}
        />
      </div>
    </div>
  );
};

export default CommunitySection;
