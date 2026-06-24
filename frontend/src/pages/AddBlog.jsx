/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import NestedList from "@editorjs/nested-list";
import CodeTool from "@editorjs/code";
import Marker from "@editorjs/marker";
import Underline from "@editorjs/underline";
import Embed from "@editorjs/embed";
import ImageTool from "@editorjs/image";
import { removeSelectedBlog } from "../utils/selectedBlogSlice";

const AddBlog = () => {
  const editorjsRef = useRef(null);
  const dispatch = useDispatch();
  const formData = new FormData();
  const { id } = useParams();
  const { token } = useSelector((slice) => slice.user);
  const { title, description, image, content } = useSelector(
    (slice) => slice.selectedBlog
  );
  const navigate = useNavigate();
  const [blogData, setBlogData] = useState({
    title: "",
    description: "",
    image: null,
    content: "",
  });

  const initializeEditorJS = () => {
    console.log("Initializing EditorJS...");
    editorjsRef.current = new EditorJS({
      holder: "editor",
      placeholder: "## Start writing here..",
      data: content,
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            placeholder: "Enter a header",
            levels: [2, 3, 4],
            defaultLevel: 3,
          },
        },
        List: {
          class: NestedList,
          inlineToolbar: true,
        },
        CodeTool,
        Marker,
        Underline,
        Embed,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              async uploadByFile(image) {
                return {
                  success: 1,
                  file: {
                    url: URL.createObjectURL(image),
                    image,
                  },
                };
              },
            },
          },
        },
      },
      onChange: async () => {
        let data = await editorjsRef.current.save();
        setBlogData((blogData) => ({ ...blogData, content: data }));
      },
    });
  };

  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", blogData.title);
    formData.append("description", blogData.description);
    formData.append("image", blogData.image);
    formData.append("content", JSON.stringify(blogData.content));

    let existingImages = [];
    blogData.content.blocks.forEach((block) => {
      if (block.type === "image") {
        if (block.data.file.image) {
          formData.append("images", block.data.file.image);
        } else {
          existingImages.push({
            url: block.data.file.url,
            imageId: block.data.file.imageId,
          });
        }
      }
    });

    formData.append("existingImages", JSON.stringify(existingImages));

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message);
      return navigate("/");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handlePostBlog = async (e) => {
    e.preventDefault();
    console.log(blogData);
    formData.append("title", blogData.title);
    formData.append("description", blogData.description);
    formData.append("image", blogData.image);
    formData.append("content", JSON.stringify(blogData.content));
    blogData?.content?.blocks?.forEach((block) => {
      if (block.type === "image") {
        formData.append("images", block.data.file.image);
      }
    });

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogs`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message);
      return navigate("/");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const fetchBlogById = async () => {
    setBlogData({
      title: title,
      description: description,
      image: image,
      content: content,
    });
  };

  useEffect(() => {
    if (id) {
      fetchBlogById();
    }
  }, []);

  useEffect(() => {
    if (!token) {
      return navigate("/signin");
    }
  }, []);

  useEffect(() => {
    if (editorjsRef.current === null) {
      initializeEditorJS();
    }
  }, []);
  console.log(window.location.pathname);

  useEffect(() => {
    if (window.location.pathname == "/add-blog") {
      dispatch(removeSelectedBlog());
    }
  }, []);

  return (
    <div className="">
      <form
        action=""
        className="w-full flex m-auto gap-10 px-20 py-5 relative mt-5 max-lg:flex-col"
        onSubmit={(e) => {
          id ? handleUpdateBlog(e) : handlePostBlog(e);
        }}
      >
        <div className="w-2/5 flex flex-col gap-10 bg-gray-200 p-5 sticky h-fit top-28 rounded-md drop-shadow-sm">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label htmlFor="title" className="">
                Title:{" "}
              </label>
              <input
                type="text"
                placeholder="title"
                id="title"
                name="title"
                className="px-3 py-2 border-b-2 border-slate-400 outline-none focus:border-green-400 duration-300 w-full drop-shadow-md rounded-sm"
                onChange={(e) => {
                  setBlogData((prev) => ({ ...prev, title: e.target.value }));
                }}
                value={blogData.title}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="description">Description: </label>
              <textarea
                type="text"
                placeholder="description"
                id="description"
                name="description"
                className="resize-none px-3 py-1 h-32 border-b-2 border-slate-400 outline-none focus:border-green-400 duration-300 w-full drop-shadow-md rounded-sm"
                onChange={(e) => {
                  setBlogData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }));
                }}
                value={blogData.description}
              />
            </div>
          </div>
          <div>
            <label htmlFor="image">
              {blogData.image ? (
                <div className="h-72 w-full  rounded overflow-hidden flex items-center justify-center drop-shadow-md">
                  <img
                    src={
                      typeof blogData.image == "string"
                        ? blogData.image
                        : URL.createObjectURL(blogData.image)
                    }
                    alt={blogData.image}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              ) : (
                <div className="text-white h-72 bg-gray-600 rounded overflow-hidden flex items-center justify-center drop-shadow-md">
                  Select image
                </div>
              )}
            </label>
            <input
              className="hidden"
              accept=".png, .jpeg, .jpg, .webp"
              type="file"
              id="image"
              name="image"
              onChange={(e) => {
                setBlogData((prev) => ({ ...prev, image: e.target.files[0] }));
              }}
            />
          </div>
          <button className="bg-gray-600 border border-black rounded w-fit px-5 py-2 text-white hover:bg-gray-700">
            {id ? "Update Blog" : "Post blog"}
          </button>

          <p><b className="text-gray-500">## Start writing here &rarr;</b></p>
        </div>

        <div className="w-3/5 bg-gray-200 rounded-md drop-shadow-sm">
          <div id="editor" className="w-full py-5"></div>
        </div>
      </form>
    </div>
  );
};

export default AddBlog;
