import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MenuBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isPathfinder = location.pathname === "/pathfinder";
  const defaultLabel = isPathfinder ? "Go to Navigation" : "Go to Pathfinder";
  const targetPath = isPathfinder ? "/" : "/pathfinder";

  const [isShort, setIsShort] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsShort(window.innerHeight < 650);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="sticky bottom-0 bg-gray-800 z-50">
      <div className="flex gap-3 justify-between border-t border-gray-700 p-2">
        <img src="/OurGreenwayCombinationMarkHorizontalWhite.svg" alt="Our Greenway Logo" className="max-h-9"/>
        <button className="p-0 !bg-white !text-black dark:bg-gray-200 dark:text-black font-semibold rounded touch-manipulation select-none appearance-none border-none outline-none" onClick={() => navigate(targetPath)}>
        {isShort ? location.pathname === "/pathfinder" ? "Navigation" : location.pathname === "/" ? "Pathfinder" : defaultLabel : defaultLabel}
        </button>
      </div>
    </div>
  );
};

export default MenuBar;