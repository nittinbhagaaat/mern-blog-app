import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

/* eslint-disable react/prop-types */
const SaveButton = ({ size, blogData }) => {
  const { token, id: userId } = useSelector((state) => state.user);
  async function handleSave(e) {
    e.preventDefault();

    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/blogs/save/${blogData?._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log(res);
      toast.success(res.data.message);

      // dispatch(addSelectedBlog(blog));
    } catch (error) {
      console.log(error.response);
      toast.error(error.response.data.message);
    }
  }
  return blogData?.totalSaves?.includes(userId) ? (
    <i
      className={`fi fi-sr-bookmark ${size}`}
      onClick={(e) => {
        handleSave(e);
      }}
    ></i>
  ) : (
    <i
      className={`fi fi-rr-bookmark ${size}`}
      onClick={(e) => {
        handleSave(e);
      }}
    ></i>
  );
};

export default SaveButton;
