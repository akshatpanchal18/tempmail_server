import { Tempuser } from "../Models/tempuser.models.js";
import apiError from "../Utils/apiError.js";
import apiResponse from "../Utils/apiResponse.js";
import asyncHandeler from "../Utils/asyncHandeler.js";
import jwt from 'jsonwebtoken'

const verifyOtp = asyncHandeler(async (req, res, next) => {
  // console.log("Request body:", req.body);
  const { otp } = req.body;
  const token = req.cookies?.refreshToken;
  // console.log("recived Token",token);
  

  if (!otp || !token) {
    throw new apiError(400, "OTP and refresh token are required");
  }

  // console.log("OTP_SECRET:", process.env.OTP_REFRESH_TOKEN);

  try {
    const decoded = jwt.verify(token, process.env.OTP_REFRESH_TOKEN);
    // console.log("Decoded token:", decoded);

    const email = decoded.email;
    // console.log("Extracted email:", email);

    const user = await Tempuser.findOne({ email });
    if (!user) {
      console.log("No user found for email:", email);
      throw new apiError(404, "User not found");
    }

    if (user.otp !== parseInt(otp, 10)) {
      throw new apiError(400, "Invalid OTP");
    }

    if (Date.now() > new Date(user.updatedAt).getTime() + 10 * 60 * 1000) {
      throw new apiError(400, "OTP expired");
    }

    console.log("OTP verification success");
    req.user = user;
    next();
  } catch (error) {
    console.error("Error during token verification:", error);
    if (error.name === "TokenExpiredError") {
      throw new apiError(401, "Token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new apiError(401, "Invalid token");
    } else {
      throw new apiError(401, "Token verification failed");
    }
  }
});


const requestNewOtp = asyncHandeler(async (req, res) => {

    // const  email  = req.cookies.tempEmail;
    const refreshToken = req.cookies.refreshToken
    const decoded = jwt.verify(refreshToken, process.env.OTP_REFRESH_TOKEN);
    console.log("Decoded token:", decoded);

    const email = decoded.email;
  
    // 1. Validate input
    if (!email || email.trim() === "") {
      throw new apiError(400, "Email is required");
    }
  
    // 2. Find the user in the Tempuser collection
    const tempUser = await Tempuser.findOne({ email });
  
    if (!tempUser) {
      throw new apiError(404, "Temporary user not found");
    }
    if (refreshToken !== tempUser.refreshToken) {
        throw new apiError(400,"Credantial's Expiered")
    }
  
    // 3. Generate a new OTP
    const otpGenerate = () => Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_TIME);
    const OTP = otpGenerate();
  console.log("new otp:",OTP);
  
    tempUser.otp = OTP;
    tempUser.expiresIn = otpExpiry;
  
    // 4. Save the updated user
    await tempUser.save();
  
    // 5. Send the new OTP (for testing; remove in production)
    console.log(`New OTP for ${email}: ${OTP}`);
  
    // 6. Send the response
    res.status(200).json(new apiResponse(200,tempUser,"New otp sent"));
  });
  
export {verifyOtp,requestNewOtp}