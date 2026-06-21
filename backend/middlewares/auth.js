const { verifyJWT } = require("../utils/generateToken");

const verifyUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(400).json({
        success: false,
        message: "Please sign in",
      });
    }
    let user = await verifyJWT(token);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Please sign in",
      });
    }
    req.user = user.id;
    console.log(req.user)
    return next();
  } catch (error) {
    console.log("ERROR: ", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong [Verify user]",
    });
  }
};

module.exports = verifyUser;
