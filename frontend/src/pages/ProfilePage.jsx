import axios from "axios";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const ProfilePage = () => {
  const { username } = useParams();
  const { token } = useSelector((state) => state.user);

  useEffect(() => {
    const handleFetchProfile = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/users/${username.split("@")[1]}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        console.log(res);
      } catch (error) {
        toast.error(error.response.data.message);
      }
    };
    handleFetchProfile();
  }, [username, token]);
  return <div>ProfilePage - {username.split("@")[1]}</div>;
};

export default ProfilePage;
