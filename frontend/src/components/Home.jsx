import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import formatDate from "../utils/formatDate";
import SaveButton from "./SaveButton";

const Home = () => {
  const [userData, setUserData] = useState([]);
  const fetchBlogs = async () => {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs`);
    setUserData(res.data.blogs);
  };
  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="w-[50%] flex flex-col gap-4 m-auto p-4 mt-10">
      {userData.map((blog) => (
        <Link to={`/blog/${blog.blogId}`} key={blog._id}>
          <div className="flex bg-green-200 items-center justify-between border border-black px-5 py-2">
            <div className="w-[70%] h-full flex flex-col gap-4">
              <p>{blog?.creator?.name}</p>
              <div className="h-[70%]">
                <h2 className="text-2xl font-bold">{blog.title}</h2>
                <p className="line-clamp-2">{blog.description}</p>
              </div>
              <div className="flex gap-10 items-center">
                <p>{formatDate(blog.createdAt)}</p>
                <div className="flex gap-8">
                  <div className="w-fit cursor-pointer flex gap-2 items-center justify-center">
                    <i className="fi fi-rr-social-network text-lg mt-1"></i>
                    <p className="text-lg">{blog.likes.length}</p>
                  </div>

                  <div className="w-fit cursor-pointer flex gap-2 items-center justify-center">
                    <i className="fi fi-sr-comments text-lg mt-1"></i>
                    <p className="text-lg">{blog.comments.length}</p>
                  </div>
                  <div className="w-fit cursor-pointer flex gap-2 items-center justify-center">
                    <SaveButton size={"text-lg"} blogData={blog} />
                    {/* <p className="text-lg">{blog.comments.length}</p> */}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[160px] h-[100px] overflow-hidden">
              <img
                src={blog.image}
                alt=""
                className="bg-slate-500 w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Home;
