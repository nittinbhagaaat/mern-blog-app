const express = require("express");
const router = express.Router();
const {
  createBlog,
  getBlog,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  saveBlog,
} = require("../controllers/blogController");
const verifyUser = require("../middlewares/auth");
const {
  postComment,
  deleteComment,
  editComment,
  likeComment,
  addNestedComment,
} = require("../controllers/commentController");
const upload = require("../utils/multer");

router.post(
  "/blogs",
  verifyUser,
  upload.fields([{ name: "image" }, { name: "images" }]),
  createBlog
);

router.get("/blogs", getBlog);

router.get("/blogs/:blogId", getSingleBlog);

router.patch(
  "/blogs/:id",
  verifyUser,
  upload.fields([{ name: "image" }, { name: "images" }]),
  updateBlog
);

router.delete("/blogs/:id", verifyUser, deleteBlog);

router.post("/blogs/like/:id", verifyUser, likeBlog);

router.post("/blogs/comment/:id", verifyUser, postComment);

router.delete("/blogs/comment/:id", verifyUser, deleteComment);

router.patch("/blogs/edit-comment/:id", verifyUser, editComment);

router.patch("/blogs/like-comment/:id", verifyUser, likeComment);

router.post("/comment/:parentCommentId/:id", verifyUser, addNestedComment);

router.patch("/blogs/save/:id", verifyUser, saveBlog);

module.exports = router;
