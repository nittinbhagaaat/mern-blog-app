import { Link, Outlet } from "react-router-dom";
import logo from "/logo.svg";
import search from "/search.svg";
import write from "/write.svg";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../utils/userSlice";
import { useState } from "react";

const Navbar = () => {
  const { token, name, profilePic } = useSelector((state) => state.user);
  const [popup, setPopup] = useState(false);
  const dispatch = useDispatch();
  function handleLogout() {
    dispatch(logout());
    setPopup((prev) => !prev);
  }
  return (
    <>
      <nav className="w-full h-20 px-20 flex justify-between items-center shadow-lg sticky top-0 z-10 bg-white">
        <div className="flex gap-5 items-center">
          <div>
            <Link to={"/"}>
              <img src={logo} alt="" className="-ml-5" />
            </Link>
          </div>
          <div className="relative">
            <img
              src={search}
              alt=""
              className="h-5 absolute top-1/2 -translate-y-1/2 ml-3 placeholder:text-black"
            />
            <input
              type="text"
              className="border border-black rounded-3xl text-lg px-2 py-1 outline-none pl-10"
              placeholder="search for a blog"
            />
          </div>
        </div>
        <div className="flex gap-7 relative">
          <Link to={"/add-blog"} className="flex items-center justify-center">
            <div className="flex items-center justify-center gap-2">
              <img src={write} alt="" className="h-5" />
              <p>write</p>
            </div>
          </Link>
          {token ? (
            <img
              src={
                profilePic
                  ? profilePic
                  : `https://api.dicebear.com/9.x/initials/svg?seed=${name}`
              }
              alt=""
              className="h-10 rounded-lg cursor-pointer hover:opacity-70"
              onClick={() => {
                setPopup((prev) => !prev);
              }}
            />
          ) : (
            <div className="flex gap-3">
              <Link to={"/signup"}>
                <button className="bg-green-500 px-4 py-2 rounded-full text-white">
                  Sign up
                </button>
              </Link>
              <Link to={"/signin"}>
                <button className="border border-green-500 px-4 py-2 rounded-full text-black">
                  Sign in
                </button>
              </Link>
            </div>
          )}
        </div>
        <div
          className={`w-40 absolute ${!popup && "hidden"} bg-gray-100 right-20 top-16 rounded-lg overflow-hidden`}
        >
          <p className="px-4 py-2 bg-gray-100 hover:bg-gray-300 cursor-pointer">
            Profile
          </p>
          <hr />
          <p className="px-4 py-2 bg-gray-100 hover:bg-gray-300 cursor-pointer">
            Settings
          </p>
          <hr />
          <p
            className="px-4 py-2 bg-red-100 hover:bg-red-300 cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </p>
        </div>
      </nav>
      <Outlet />
    </>
  );
};

export default Navbar;
