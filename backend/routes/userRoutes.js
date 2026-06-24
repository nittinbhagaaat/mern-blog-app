const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  getUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  googleAuth,
  verifyEmail,
  followUser
} = require("../controllers/userController");
const verifyUser = require("../middlewares/auth");

router.post("/signup", createUser);

router.post("/signin", loginUser)

router.get("/users", getUsers);

router.get("/users/:username", getSingleUser);

router.patch("/users/:id", updateUser);

router.delete("/users/:id", deleteUser);

router.get("/verify-email/:token", verifyEmail);

router.patch("/follow/:id", verifyUser, followUser);

router.post("/google-auth", googleAuth);

module.exports = router;
