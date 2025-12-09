import { useState, useEffect } from "react";
import { Link } from "react-router"; // react-router-dom use karo to yaha change kar lena

const Footer = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      const fsElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      setIsFullscreen(!!fsElement);
    };

    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("webkitfullscreenchange", handleChange);
    document.addEventListener("mozfullscreenchange", handleChange);
    document.addEventListener("MSFullscreenChange", handleChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("webkitfullscreenchange", handleChange);
      document.removeEventListener("mozfullscreenchange", handleChange);
      document.removeEventListener("MSFullscreenChange", handleChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        const root =
          document.documentElement ||
          document.body ||
          document.getElementById("root");

        if (root.requestFullscreen) {
          await root.requestFullscreen();
        } else if (root.webkitRequestFullscreen) {
          root.webkitRequestFullscreen();
        } else if (root.mozRequestFullScreen) {
          root.mozRequestFullScreen();
        } else if (root.msRequestFullscreen) {
          root.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (e) {
      console.error("Fullscreen toggle error:", e);
    }
  };

  return (
    <>
      <div className="lg:h-[15rem] h-auto w-full flex flex-col gap-6 p-6 lg:p-10 footer mb-[3rem]">
        {/* Top part */}
        <div className="w-full flex justify-between gap-10">
          <div className="ml-[1rem] lg:ml-[4rem] flex flex-col ">
            {/* 🔥 NEW: SVG logo same as navbar */}
            <div className="flex items-center gap-3">
              <img
                src="/1765308468557~4.jpg" // public/groovia-logo.svg
                alt="Groovia"
                className="w-10 h-10 lg:w-11 lg:h-11 rounded-full shadow-[0_0_18px_rgba(208,64,255,0.9)]"
              />
              <div className="gap-1">
                <span className="Musi font-extrabold text-2xl lg:text-3xl">
                  Groo
                </span>
                <span className="fy font-extrabold text-2xl lg:text-3xl">
                  via
                </span>
              </div>
            </div>

            <div>
              <pre className="lg:text-sm text-xs">
                Made with ♥️ by Rolex Sir.
              </pre>
            </div>
          </div>

          <div className="lg:block hidden">
            <ul className="flex flex-col gap-[0.2rem] pb-5">
              <p className=" font-sans text-xs font-semibold pb-2">
                TOP ARTISTS
              </p>
              <li>
                <Link to={`/artists/459320`}>Arijit Singh</Link>
              </li>
              <li>
                <Link to={`/artists/456863`}>Badshah</Link>
              </li>
              <li>
                <Link to={`/artists/485956`}>Honey Singh </Link>
              </li>
              <li>
                <Link to={`/artists/468245`}>Diljit Dosanjh </Link>
              </li>
              <li>
                <Link to={`/artists/672167`}>Haardy Sandhu </Link>
              </li>
              <li>
                <Link to={`/artists/881158`}>Jubin Nautiyal</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Fullscreen toggle – center bottom */}
        <div className="w-full flex justify-center">
          <button
            onClick={toggleFullscreen}
            className="
              flex items-center gap-2 px-5 py-2.5
              rounded-full border border-white/15
              bg-white/5 hover:bg-white/10
              text-sm lg:text-base font-medium
              shadow-[0_0_20px_rgba(255,255,255,0.1)]
              transition-all duration-200
              active:scale-95
            "
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: isFullscreen ? "#22c55e" : "#f97316" }}
            ></span>
            {isFullscreen ? "Exit Immersive Mode" : "Go Immersive (Fullscreen)"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Footer;
