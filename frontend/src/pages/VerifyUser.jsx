/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

const VerifyUser = () => {
  const { token } = useParams();
  console.log(token)
  const navigate = useNavigate();

  useEffect(() => {
    async function verifyUser() {
      try {
        const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/verify-email/${token}`
      );
      console.log(res);
      toast.success(res.data.message);
      } catch (error) {
        console.log(error)
        toast.error(error.response.data.message);
      } finally{
        navigate("/signin");
      }
    }
    verifyUser();
  }, [token]);
  return <div>VerifyUser</div>;
};

export default VerifyUser;
