import asyncHandeler from "../Utils/asyncHandeler.js";
import apiError from "../Utils/apiError.js";
import apiResponse from "../Utils/apiResponse.js";
import { User } from "../Models/user.models.js";
import {Tempmail} from '../Models/email.models.js'
import jwt from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import { Tempuser } from "../Models/tempuser.models.js";
// import { otp } from "../Middelware/nodemailer.middelware.js";

const genrateAccessAndRefreshToken = async (userId) => {
  // console.log("Recived user Id",userId);
  try {
    const usertoken = await User.findById(userId);
    // console.log("User ID in genrateAccessToken:", usertoken);

    // console.log("Generating Access Token...");
    const accessToken = usertoken.generateAccessToken();
    //    console.log("Access Token:", accessToken);

    //    console.log("Generating Refresh Token...");
    const refreshToken = usertoken.generateRefreshToken();
    usertoken.refreshToken = refreshToken;
    // console.log("Refresh Token:", refreshToken);

    // console.log("Saving User...");
    await usertoken.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(500, "something went Wrong while genrate token");
  }
};

//register user
const registerUser = asyncHandeler(async (req, res) => {
  // const {  email, username, password } = req.body;
  const user = req.user
  const email = user.email
  const username = user.username
  const password = user.password
  // console.log("from registerUser","email:",email,"Password:",password,"Username:",username);
  // console.log(req.body);
  if (
    [ email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "User with email or username already exists");
  }
  
  
  const newUser = await User.create({
    email,
    password,
    username,
  });

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "Something went wrong while registering the user");
  }
   
  const deleteTempUser = await Tempuser.deleteOne({"email":email})
  if (!deleteTempUser) {
    throw new apiError(400,"user not deleted from TempUsers")
  }
console.log(`Tempuser deleted ${email}`);
console.log(`User created success`);

  return res
    .status(201)
    // .clearCookie("refreshToken")
    .json(new apiResponse(200, createdUser, "User registered Successfully"));
    // .json(new apiResponse(200,{},`Tempuser ${email} deleted`));
    
});

//login functionality
const loginUser = asyncHandeler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, password } = req.body;
  // console.log("email:",email,"Password:",password);
  // console.log(req.body);
  if (!email) {
    throw new apiError(400, "email is required");
  }

  const user = await User.findOne({
    $or: [{ email }],
  });
  console.log(user);
  

  if (!user) {
    throw new apiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(401, "Invalid user credentials");
  }
  // console.log("passed user ID",user._id);

  const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
    user._id
  );
  //    console.log(accessToken,refreshToken);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    // secure: true,
    sameSite: 'None',
    secure: false,
  };
  // console.log("User logged in success");
  

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandeler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    // secure: true,
    sameSite: 'None',
    secure: false,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged Out"));
});


const getAllEmails = asyncHandeler(async (req,res) => {
  const {userId} = req.params
  // const userId = req.user._id;
  // if(!isValidObjectId(userId)){
  if(!userId){
    throw new apiError(400,"invalid userID")
  }
const serachEmail = await Tempmail.find({"createdBy":userId})

if(!serachEmail){
  throw new apiError(400,"tempemail not found")
}
// console.log(serachEmail);
res.status(200)
.json(new apiResponse(200,serachEmail,"Temp mail found"))

});


const refreshAccessToken = asyncHandeler(async (req, res) => {
  const incommingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incommingRefreshToken) {
    throw new apiError(401, "Unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new apiError(401, "Invalid RefreshToken");
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "Token is expired or used");
    }

    const options = {
      httpOnly: true,
      // secure: true,
      secure: false,
      sameSite: 'None',
      
    };
    const { accessToken, newRefreshToken } = await genrateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, newRefreshToken },
          "Access token Renewed"
        )
      );
  } catch (error) {
    throw new apiError(401, error?.message, "Invalid token");
  }
});

//updation on user profile

const changeCurrentPassword = asyncHandeler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new apiError(400, "invalid password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, "password changed successfully"));
});

const getCurrentUser = asyncHandeler(async (req, res) => {
  const user = req.user
  // console.log(user._id);
  
   try {
    const userData = await User.aggregate([
     {
       $match:{_id:user._id}
     },
     {
       $lookup:{
         from:'tempmails',
         localField:'_id',
         foreignField:'createdBy',
         as:'createdMails'
       },
     },
    //  {
    //    $unwind: { path: '$createdMails', preserveNullAndEmptyArrays: true }, // Unwind email details
    //  },
     {
      $project: {
        _id: 1,
        username: 1,
        email: 1,
        createdMails: 1,
      }
    }
    ])
    // console.log('User Data:', userData);
   return res
     .status(200)
     .json(new apiResponse(200, userData[0], "Current user fetched succesfully"));
   } catch (error) {
    return res.status(500).json(new apiError(500, null, "Error fetching current user: " + error.message));
   }
});

const updateUserProfile = asyncHandeler(async (req, res) => {
  const { email } = req.body;

  if (! email) {
    throw new apiError(400, "All field are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new apiResponse(200, { user }, "Account details updated successfully")
    );
});

const deleteUser = asyncHandeler(async (req,res) => {
  const user = await User.findOne({
    $or: [
        { email: email?.trim() }, 
        { username: username?.trim() } 
    ]
  });
  if (!user) {
    throw new apiError(404, "User not found");
  }
  
  const deletedUser = await User.findByIdAndDelete(user._id);
  
  if (!deletedUser) {
    throw new apiError(500, "Error while deleting user");
  }
  res.status(200).json(new apiResponse(200, {}, "User deleted successfully"));
  
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserProfile,
  deleteUser,
  getAllEmails
};
