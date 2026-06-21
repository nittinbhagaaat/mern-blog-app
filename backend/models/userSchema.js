const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: [true, "Username must be unique"]
    },
    password: {
      type: String,
    },
    blogs: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Blog",
        },
      ],
      default: []
    },
    verify: {
      type: Boolean,
      default: false,
    },
    googleAuth: {
      type: Boolean,
      default: false
    },
    profilePic: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [50, "Bio cannot exceed 50 characters"],
      default: ""
    },
    followers: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      ]
    },
    following: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      ]
    },
    savedBlogs: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Blog",
        },
      ],
      default: []
    },
    likedBlogs: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Blog",
        },
      ],
      default: []
    },
    showLikedBlogs: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
