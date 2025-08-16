import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import {
  uploadOnCloudinary,
  deleteFileFromCloudinary,
} from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";

const generateAccessRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return {};
    const accessToken = user.createAccessToken();
    const refreshToken = user.createRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      401,
      "Something went wrong while creating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { userName, fullname, email, password } = req.body;
  if (
    [userName, fullname, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(401, "All fields are required");
  }

  console.log("📥 Incoming registration:", req.body);

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(401, "User Is Already Exist");
  }
  console.warn("Files", req.files);
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(401, "Avatar File Is Missing");
  }

  let avatar = "";
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("Avatar File Uploaded");
  } catch (error) {
    console.log("Failed to upload avatar Image", error);
    throw new ApiError(401, "Failed to upload avatar file");
  }

  let coverImage = "";
  try {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
    console.log("uploaded cover image", coverImage);
  } catch (error) {
    console.log("Failed to upload coverImage", error);
    throw new ApiError(401, "Failed to upload cover Image");
  }

  try {
    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      userName: userName.toLowerCase(),
    });

    console.log("is User created", user);

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering the user"
      );
    }

    res
      .status(200)
      .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
  } catch (error) {
    console.log("❌ user creation failed:", error.message);
    console.log("🔍 Error stack:", error.stack);

    try {
      if (avatar?.public_id) {
        await deleteFileFromCloudinary(avatar.public_id);
      }
      if (coverImage?.public_id) {
        await deleteFileFromCloudinary(coverImage.public_id);
      }
    } catch (cleanupError) {
      console.warn("⚠️ Cleanup failed:", cleanupError.message);
    }

    throw new ApiError(
      500,
      "Something went wrong while registering user and images were deleted"
    );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;
  if ([email, userName, password].some((value) => value.trim === "")) {
    throw new ApiError(401, "All fields are required");
  }

  const user = await User.findOne({ email, userName });
  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const isPasswordValid = user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessRefreshToken(
    user._id
  );
  console.log({ accessToken123: accessToken, refreshToken });

  const loggedInUser = await User.findById(user._id).select(
    "-refreshToken -password"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "Production",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        "User login Successfully"
      )
    );
});

//this request comes when user accestoken validity expires and he logsout so
//instead login again using their credentials he will click on a button or something
//upto you to login again so we trigger generaterefreshToken api on click of button
//and user logs in the application just like in jira.

const generateRefreshToken = asyncHandler((req, res) => {
  const incomingRefreshToken = req.cookies || req.body;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh Token is missing");
  }

  const decodeRefreshToken = jwt.verify(
    incomingRefreshToken,
    process.env.RERESH_TOKEN_SECRET
  );

  const user = User.findById(decodeRefreshToken._id);

  if (!user) {
    throw new ApiError(401, "Invalid Refresh Token");
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Invalid Refresh Token");
  } // so user can send wrong refreshtoken , or it might be happen that refreshToken
  // is deleted when user logout and he is trying to login even after using its expired
  //refresh token.

  const { accessToken, refreshToken: newRefreshToken } =
    generateAccessRefreshToken(user_id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "Production",
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Refresh Token Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }
  User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
      new: true,
    },
  });

  const options = {
    httpOnly: true,
    secure: (process.env.NODE_ENV = "Production"),
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(200, {}, "User Logout Successfully");
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if ([oldPassword, newPassword].some((value) => value.trim === "")) {
    throw new ApiError(401, "All Fields Are Required");
  }
  const user = await User.findById(req.user).select("-password,-refreshToken");

  if (!user) {
    throw new ApiError(401, "Password is Invalid");
  }

  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Password Is Invalid");
  }

  await User.findByIdAndUpdate(
    req.user._id,
    {
      password: newPassword,
    },
    { new: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Updated Successfully"));
});

const updateUserAccount = asyncHandler(async (req, res) => {
  const { userName, fullname, email } = req.body;
  if ([userName, fullname, email].some((value) => value.trim() === "")) {
    throw new ApiError(401, "All Fields Are Required");
  }

  const user = User.findByIdAndUpdate(
    req.user._id,
    {
      userName,
      email,
      fullname,
    },
    {
      new: true,
    }
  ).select("-password,-refreshToken");

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  res.status(200).json(200, user, "User updated Successfully");
});

const updateAvatarImage = asyncHandler(async (req, res) => {
  const { avatarImage } = req.file.path;
  if (!avatarImage) {
    throw new ApiError(401, "Avatar Image is Required");
  }

  const avatarLocalPath = await uploadOnCloudinary(avatarImage);
  if (!avatarLocalPath.url) {
    throw new ApiError(
      500,
      "Something went wrong while uploading image on cloudinary"
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      avatar: avatarLocalPath.url,
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(500, "Something went wrong while updating avatar");
  }

  res.status(200).json(new ApiError(200, user, "Avatar Updated Successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImage = req.file.path;

  if (!coverImage) {
    throw new ApiError(401, "Cover Image is Required");
  }

  const coverImageLocalPath = await uploadOnCloudinary(coverImage);
  if (!coverImageLocalPath.url) {
    throw new ApiError(
      500,
      "Something went wrong while uploading cover Image on cloudinary"
    );
  }

  const user = User.findByIdAndUpdate(
    req.user._id,
    {
      coverImage: coverImageLocalPath.url,
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(500, "Something went wrong while updaing cover image ");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image Successfully Updated"));
});

 const getCurrentUserDetails = asyncHandler(async(req,res)=>{
   res.status(200).json(200,req.user,"User fetched Successfully")
 })

export {
  registerUser,
  loginUser,
  generateRefreshToken,
  logoutUser,
  changeCurrentPassword,
  updateUserAccount,
  updateCoverImage,
  updateAvatarImage,
  getCurrentUserDetails
};
