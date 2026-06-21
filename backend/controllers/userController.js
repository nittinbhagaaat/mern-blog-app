const bcrypt = require("bcrypt");
const User = require("../models/userSchema");
const { generateJWT, verifyJWT } = require("../utils/generateToken");
const transporter = require("../utils/transporter");
const { getAuth } = require("firebase-admin/auth");
const ShortUniqueId = require("short-unique-id");
const { randomUUID } = new ShortUniqueId({ length: 5 });

// FIREBASE
const admin = require("firebase-admin");
const Blog = require("../models/blogSchema");
admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "blogify-66da3",
    private_key_id: "b1b382c49044faa1ebb9782e25f71307c53666d0",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDfzU357of8apuG\nmKRB9ltKhXFqvr1OD2E2TPweX8dJQ0q+IhjSbkKTczTMhhCmhE3oRX/ddv1pIyvn\nbBRb6WCrMsJU/pYMZtCtJXtsrb3glW6+hAKqcjGnZaI/mW0P8a+HZeh6bts/YKtQ\nYfYjVmZjTUiNs3cKYTk963EXqzhgizZH+bv+8a5gjrzUG6WtI1xM7lq6c+8ETXtQ\n44kTg5qFstm+vZ1DyQ0wvCFu+2WttFvQbVY60NQY35crdLzk5d0/ezsFsG/uY6cG\nWt5U1WCJ3l1Z8NILmtJQ9Gx87kq3DoP8LNTA08boqM1HmtQmAs8fMuuKd1xStfmT\n6LYTIW8TAgMBAAECggEAUzbTN4sppQE+st0uthgT+bGEalxhpxSw4K/fTqvuPZ93\nuxqSgCvfNVQw3Zs7ta6cCTFOSdpkfyNEv9e/+izcdMt61n+S6ymPjdHSAqbXYxot\nA0mydA3hyIxRt7QkiTkkOwP5XQy7GOWozUqfaqRFjca+o3GHYaSk1BEnC9XuMHbg\nuRlI6bLhofWA8Vjl89tV/vw8yUj4pPBkvKBpXrx8/BA1zhcizGLysb1I2qWOtpSn\nnKDI4fZfesDJFXxYygQN5b5/VreqWWmdI7N9D61CqPqlOuU23NkSuSURZYzWU5bH\n2IB1/AUSDcR54uWusx1Vq/mwLlN666rdD6XnOHn/gQKBgQD1hUIXR4hoGzt2+CAO\nIZts3hoc6Xvr/rpTbJHykHDpZKDM7i6PLBbBaMbMjwhKhsYMZ/8DyKHg6no1qq2w\nmzEm1moSihRmFfUIwEh8BqJ5eHfa10W/WzAzOUZ1vRz97FnvMb2ZeIdV+WCJJjK7\nsA2gRp1Qr8gPydHY1qqF8mYs7QKBgQDpWruoDAEbsX/0Q5cqfTrYzO+EMAv+gVyX\n3uLBDCweTCF+oQWMdW4PuVW0GR3e2Tz+tisHSAA0uWcwhe5mJhqo3D7+PNawvy1U\nrca8XjobHC+7RDKI1ZCdOGAHHEkF2olDG13EJOI6nK6NVwgZi4PMan4c3wRBSB2w\n2XNmcA6L/wKBgHNniNJScF6m9kOMi9y4lUsN9u5CHVqnaEOQU+XVWQ2LnD3XcxEf\nIy8UJeW/EaGeSfdI5siLhPOoo3sYV/4cZHUh8cf3GXGGvp+3ahrKL5KzOnsmFwXE\nQhrBwEnVc4wzjW5uTfWWft69kk/FIbGxJiaBKq7jgUFSlw26kXrWnopdAoGBAMuv\n5D9CAzGeFPcsjGWNG/GjqKn0mnOTjTQPXFRvgI8NmusCOGqrEd/twW5LwjQD4Wbf\nsd1QLsXW08iaD0bgmcKtRNr8VdW/eh0A9ojzorqJNuy6EXY5HFrvm3p5aRAP+mI2\nH/mWzFWm8AH1Zt+NVQT4K46d6APno+r7U+ylgT0XAoGBAKfwhZlEPq45PXVTWXAR\nuvVEkropAXttJbAeTxG5/1LyU2XJMAG4rJeSrrpEzpBcN98fNKTWFGRSP9S00tfL\nC2QoLO3fYSk4pv8pwNYPHevaSyEwlMQ3F0XG6h6qyMdgRFzaPwoopqjXD7zoanvD\n9CIBUB6H45NYlbLWq1Di23fY\n-----END PRIVATE KEY-----\n",
    client_email:
      "firebase-adminsdk-fbsvc@blogify-66da3.iam.gserviceaccount.com",
    client_id: "107778643633842779259",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40blogify-66da3.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  }),
});

const googleAuth = async (req, res) => {
  try {
    const { accessToken } = req.body;
    let response = await getAuth().verifyIdToken(accessToken);
    const { name, email } = response;
    let user = await User.findOne({ email });
    if (user) {
      if (user.googleAuth) {
        // REGISTERED
        let token = await generateJWT({
          email: user.email,
          id: user._id,
        });
        return res.status(200).json({
          message: "Logged in successfully",
          success: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            token,
          },
        });
      } else {
        return res.status(400).json({
          message: "This email is already registered",
          success: true,
        });
      }
    }

    let newUser = await User.create({
      name,
      email,
      googleAuth: true,
      verify: true
    });

    let token = await generateJWT({
      email: newUser.email,
      id: newUser._id,
    });
    return res.status(200).json({
      message: "Registered successfully",
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        token,
      },
    });

    console.log(res);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong - [Google auth]",
      success: false,
    });
  }
};

const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      if (user.googleAuth) {
        return res.status(400).json({
          message: "This email is already registered using google",
          success: true,
        });
      }
      if (user?.verify) {
        return res.status(400).json({
          message: "Email already exist.",
          success: false,
        });
      } else {
        let token = await generateJWT({
          email: user.email,
          id: user._id,
        });

        // EMAIL
        const sentMail = transporter.sendMail({
          from: "nitinbhagatxyz@gmail.com",
          to: user?.email,
          subject: "Veirfy Your Blogify Account",
          text: "Please verify your blogify account",
          html: `<h1>Click <a href="http://localhost:5173/verify-email/${token}">here</a> to verify</h1>`,
        });

        return res.status(400).json({
          message: "Please check your email for verification",
          success: false,
        });
      }
    }
    const hash = await bcrypt.hash(password, 10);
    const username = `${email
      .toLowerCase()
      .split("@")[0] + "-" + randomUUID()}`
    const newUser = await User.create({ name, username, email, password: hash });
    let token = await generateJWT({
      email: newUser.email,
      id: newUser._id,
    });

    // EMAIL
    const sentMail = transporter.sendMail({
      from: "nitinbhagatxyz@gmail.com",
      to: email,
      subject: "Veirfy Your Blogify Account",
      text: "Please verify your blogify account",
      html: `<h1>Click <a href="http://localhost:5173/verify-email/${token}">here</a> to verify</h1>`,
    });

    return res.status(200).json({
      message: "Please check your email for verification",
      success: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong - [Create user]",
      success: false,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
        success: false,
      });
    }
    const user = await User.findOne({ email }).populate();
    if (!user) {
      return res.status(500).json({
        message: "User not found",
        success: false,
      });
    }
    if (user.googleAuth) {
      return res.status(400).json({
        message: "This email is already registered using google",
        success: true,
      });
    }
    if (!user?.verify) {
      // send verification emal again
      let token = await generateJWT({
        email: user.email,
        id: user._id,
      });

      // EMAIL
      const sentMail = transporter.sendMail({
        from: "nitinbhagatxyz@gmail.com",
        to: user?.email,
        subject: "Veirfy Your Blogify Account",
        text: "Please verify your blogify account",
        html: `<h1>Click <a href="http://localhost:5173/verify-email/${token}">here</a> to verify</h1>`,
      });

      return res.status(500).json({
        message: "Please verify your account before login",
        success: false,
      });
    }
    let token = await generateJWT({
      email: user.email,
      id: user._id,
    });
    const pass = await bcrypt.compare(password, user.password);
    if (!pass) {
      return res.status(400).json({
        message: "Incorrect password",
        success: false,
      });
    }
    console.log("USER: ", user);
    return res.status(200).json({
      message: "User login successfully",
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        token,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong - [Login user]",
      success: false,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate({
      path: "blogs",
      select: "-creator",
    });
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong - [Get users]",
      success: false,
    });
  }
};

const getSingleUser = async (req, res) => {
  try {
    let { id } = req.params;
    let user = await User.findById(id).populate({
      path: "blogs",
    });
    if (!user) {
      return res.status(200).json({
        message: "User not found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "User fetched successfully",
      success: true,
      user,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong - [Get single user]",
      success: false,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    let { id } = req.params;
    let newUser = await User.findByIdAndUpdate(
      id,
      {
        $set: { name, email, password },
      },
      { new: true }
    );
    if (!newUser) {
      return res.status(200).json({
        message: "User not found",
        success: false,
      });
    }
    // users[userIndex] = { ...users[userIndex], ...req.body };
    return res.status(200).json({
      message: "User updated successfully",
      success: true,
      newUser,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong - [Update user]",
      success: false,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    let { id } = req.params;
    const delUser = await User.findByIdAndDelete(id);
    if (!delUser) {
      return res.status(200).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User deleted successfully",
      success: true,
      delUser,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong - [Delete user]",
      success: false,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const verifyToken = await verifyJWT(token);
    if (!verifyToken) {
      return res.status(402).json({
        success: false,
        message: "Invalid token/ email expired",
      });
    }
    console.log(verifyToken);
    const { id } = verifyToken;
    const user = await User.findByIdAndUpdate(
      id,
      { verify: true },
      { new: true }
    );
    if (!user) {
      return res.status(200).json({
        message: "User not found",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


const saveBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    console.log(id, user);
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(500).json({
        success: false,
        message: "Blog not found",
      });
    }
    await User.findByIdAndUpdate(user, { $push: { savedBlogs: id } })
    return res.status(200).json({
      success: true,
      message: "Blog saved"
    })
  } catch (error) {
    console.log("ERROR: ", error)
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  getUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  verifyEmail,
  googleAuth,
  saveBlog
};
