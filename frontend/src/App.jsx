// import "./App.css";
import { Route, Routes } from "react-router-dom";
import Authform from "./pages/Authform";
import Navbar from "./components/Navbar";
import AddBlog from "./pages/AddBlog";
import BlogPage from "./pages/BlogPage";
import VerifyUser from "./pages/VerifyUser";
import ProfilePage from "./pages/ProfilePage";
import Home from "./pages/Home";

function App() {
  return (
    <div className="h-full w-screen">
      <Routes>
        <Route path="/" element={<Navbar />}>
          <Route path="/" element={<Home />}></Route>
          <Route path="/signup" element={<Authform type={"signup"} />}></Route>
          <Route path="/signin" element={<Authform type={"signin"} />}></Route>
          <Route path="/add-blog" element={<AddBlog />}></Route>
          <Route path="/blog/:blogId" element={<BlogPage />}></Route>
          <Route path="/edit/:id" element={<AddBlog />}></Route>
          <Route path="/verify-email/:token" element={<VerifyUser />}></Route>
          <Route path="/:username" element={<ProfilePage />}></Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
