import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import {User} from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js";
const verifyJWT = asyncHandler(async (req, res) => {
  try {
    const accessToken =
      req.cookies || req.header("authorization").replace("Bearer ", "");
    if (!accessToken) {
      throw new ApiError(401, "Unauthorized");
    }

    const decodeToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );
    if (!decodeToken) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = await User.findById(decodeToken._id).select(
      " -password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized");
  }
});

export default verifyJWT;
