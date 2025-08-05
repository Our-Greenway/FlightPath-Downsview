
import { useLocation, useNavigate } from "react-router-dom";
const MenuBar = () => {  
  const location = useLocation();
  const navigate = useNavigate();

  const isPathfinder = location.pathname === "/pathfinder";
  const buttonLabel = isPathfinder ? "Go to Navigation" : "Go to Pathfinder";
  const targetPath = isPathfinder ? "/" : "/pathfinder";
  
    return (
      <div className="sticky bottom-0 bg-gray-800 ">
        <div className="flex justify-between border-t p-2 flex ">
          <img src="/OurGreenwayCombinationMarkHorizontalWhite.svg" alt="Our Greenway Logo" className="max-h-11"/>
          <button className="px-2 bg-gray-300 text-black rounded" onClick={() => navigate(targetPath)}>
            {buttonLabel}
          </button>
        </div>
      </div>
    );
  }
export default MenuBar  