import asyncHandler from "../Utils/asyncHandeler.js";
import apiError from "../Utils/apiError.js";
import { Tempuser } from "../Models/tempuser.models.js";

const genrateRefreshToken = async (userId) => {
  console.log("Recived user Id",userId);
  try {
    const usertoken = await Tempuser.findById(userId);
    if (!usertoken) {
      throw new apiError(404, "User not found");
    }
       console.log("Generating Refresh Token...");
    const refreshToken = usertoken.generateRefreshToken();
    usertoken.refreshToken = refreshToken;
    console.log("Refresh Token:", refreshToken);

    console.log("Saving User...");
    // await usertoken.save({ validateBeforeSave: false });

    return { refreshToken };
  } catch (error) {
    throw new apiError(500, "something went Wrong while genrate token");
  }
};
const registerTempUser = asyncHandler(async (req, res,next) => {
  const { email, username, password } = req.body;

  // Validate input
  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new apiError(400, "All fields are required");
  }

  // Check for existing user
  const existingUser = await Tempuser.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    // throw new apiError(400, "Email or username already exists");
    res.status(403).json(new apiError(403,"Email or username already exists"))
  }

  // Generate OTP
  const otpGenerate = () => Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  const OTP_EXPIRY_TIME = 10 * 60 * 1000;
  const otpExpiry = new Date(Date.now() + OTP_EXPIRY_TIME);
  const OTP = otpGenerate();
  // const OTP = 123456;
  // console.log(`Generated OTP: ${OTP}`);

  // Create user
  const tempUser = await Tempuser.create({
    email,
    username,
    password,
    otp:OTP,
    expiresIn: otpExpiry,
  });
  const { refreshToken } = await genrateRefreshToken(tempUser._id);
  tempUser.refreshToken = refreshToken;
  await tempUser.save({ validateBeforeSave: false });

  console.log("User created Successfully");
  
  // Send success response
  // res.status(201)
  // .json(new
  //   apiResponse(201,{tempUser} ,"Temporary user registered successfully")
  // );
  req.otp=OTP;
  req.user = tempUser
  next()
  
});


export { registerTempUser};
