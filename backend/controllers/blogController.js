const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const User = require("../models/userSchema");
const { uploadImage, deleteImage } = require("../utils/uploadImage");
const fs = require("fs");
const ShortUniqueId = require("short-unique-id");
const { randomUUID } = new ShortUniqueId({ length: 15 });

const createBlog = async (req, res) => {
  try {
    const creator = req.user;
    const { title, description, draft } = req.body;
    const { image, images } = req.files;
    console.log(image[0].buffer)
    const content = JSON.parse(req.body.content);

    if (!title || !description || !content) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    const findUser = await User.findById(creator);
    if (!findUser) {
      res.status(500).json({
        success: false,
        message: "User not found",
      });
    }

    // CLOUDINARY ------------------------------

    let imageIndex = 0;

    for (let i = 0; i < content.blocks.length; i++) {
      const block = content.blocks[i];
      if (block.type === "image") {
        const { secure_url, public_id } = await uploadImage(
          `data:image/jpeg;base64,${images[imageIndex].buffer.toString(
            // comma error was fixed!!
            "base64"
          )}`
        );

        block.data.file = {
          url: secure_url,
          imageId: public_id,
        };

        imageIndex++;
      }
    }

    const { secure_url, public_id } = await uploadImage(
      `data:image/jpeg;base64,${image[0].buffer.toString("base64")}`
    );
    console.log(image[0].buffer.toString("base64"));

    const blogId = `${title
      .toLowerCase()
      .split(/[^a-zA-Z0-9]+/)
      .join("-")}-${randomUUID()}`;
    const blog = await Blog.create({
      title,
      description,
      draft,
      creator,
      image: secure_url,
      imageId: public_id,
      blogId,
      content,
    });

    await User.findByIdAndUpdate(creator, { $push: { blogs: blog._id } });
    return res.status(200).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getBlog = async (req, res) => {
  try {
    const blogs = await Blog.find({ draft: false }).populate({
      path: "creator",
      select: "-password -blogs",
    });
    return res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      blogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getSingleBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findOne({ blogId })
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "creator",
        select: "name email",
      })
      .lean();

    async function populateReplies(comments) {
      for (const comment of comments) {
        let populatedComment = await Comment.findById(comment._id)
          .populate({
            path: "replies",
            populate: {
              path: "user",
              select: "name email",
            },
          })
          .lean();
        comment.replies = populatedComment.replies;
        if (comment?.replies?.length > 0) {
          await populateReplies(comment.replies);
        }
      }
      return comments;
    }

    blog.comments = await populateReplies(blog.comments);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      blog,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateBlog = async (req, res) => {
  try {
    const creator = req.user;
    const { id } = req.params;
    const { title, description, draft } = req.body;
    const content = JSON.parse(req.body.content);
    const existingImages = JSON.parse(req.body.existingImages);
    const blog = await Blog.findOne({ blogId: id });

    if (!blog) {
      return res.status(500).json({
        success: false,
        message: "Blog not found",
      });
    }
    if (!(creator == blog.creator)) {
      return res.status(400).json({
        success: false,
        message: "You are not authorized",
      });
    }

    let imagesToDelete = blog.content.blocks
      .filter((block) => block.type == "image")
      .filter(
        (block) => !existingImages.find(({ url }) => url == block.data.file.url)
      )
      .map((block) => block.data.file.imageId);

    if (imagesToDelete.length > 0) {
      await Promise.all(imagesToDelete.map((id) => deleteImage(id)));
    }

    // CLOUDINARY

    if (req.files.images) {
      let imageIndex = 0;

      for (let i = 0; i < content.blocks.length; i++) {
        const block = content.blocks[i];
        if (block.type === "image" && block.data.file.image) {
          const { secure_url, public_id } = await uploadImage(
            `data:image/jpeg;base64,${req.files.images[
              imageIndex
            ].buffer.toString(
              // comma error was fixed!!
              "base64"
            )}`
          );

          block.data.file = {
            url: secure_url,
            imageId: public_id,
          };

          imageIndex++;
        }
      }
    }

    if (req.files.image) {
      await deleteImage(blog.imageId);
      const { secure_url, public_id } = await uploadImage(
        `data:image/jpeg;base64,${req.files.image[0].buffer.toString("base64")}`
      );
      blog.image = secure_url;
      blog.imageId = public_id;
    }

    blog.title = title || blog.title;
    blog.description = description || blog.description;
    blog.draft = draft || blog.draft;
    blog.content = content || blog.content;

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const creator = req.user;
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(500).json({
        success: false,
        message: "Blog not found",
      });
    }
    if (!(creator == blog.creator)) {
      return res.status(500).json({
        success: false,
        message: "You are not authorized",
      });
    }
    await deleteImage(blog.imageId);
    await Blog.deleteOne({ _id: id });
    await User.findByIdAndUpdate(creator, { $pull: { blogs: id } });
    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(500).json({
        success: false,
        message: "Blog not found",
      });
    }
    if (!blog.likes.includes(user)) {
      await Blog.updateOne({ _id: id }, { $push: { likes: user } });
      await User.findByIdAndUpdate(user, { $push: { likedBlogs: id } })
      res.status(200).json({
        success: true,
        message: "Blog liked successfully",
        isLiked: true,
      });
    } else {
      await Blog.updateOne({ _id: id }, { $pull: { likes: user } });
      await User.findByIdAndUpdate(user, { $pull: { likedBlogs: id } })
      res.status(200).json({
        success: true,
        message: "Blog disliked successfully",
        isLiked: false,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const saveBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(500).json({
        success: false,
        message: "Blog not found",
      });
    }
    if (!blog.totalSaves.includes(user)) {
      await Blog.updateOne({ _id: id }, { $set: { totalSaves: user } });
      await User.findByIdAndUpdate(user, { $set: { savedBlogs: id } })
      res.status(200).json({
        success: true,
        message: "Blog saved",
      });
    } else {
      await Blog.updateOne({ _id: id }, { $unset: { totalSaves: user } });
      await User.findByIdAndUpdate(user, { $unset: { savedBlogs: id } })
      res.status(200).json({
        success: true,
        message: "Blog unsaved",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBlog,
  getBlog,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  saveBlog
};
