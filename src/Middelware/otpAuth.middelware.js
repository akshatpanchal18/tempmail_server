import { Tempuser } from "../Models/tempuser.models";
import apiError from "../Utils/apiError";
import asyncHandeler from "../Utils/asyncHandeler";
import jwt from 'jsonwebtoken'

const validateOTPRefreshToken = asyncHandeler(async (req, res, next) => {
    const { refreshToken } = req.body;
  
    if (!refreshToken) {
      throw new apiError(400, "Refresh token is required");
    }
  
    try {
      const decoded = jwt.verify(refreshToken, process.env.OTP_REFRESH_TOKEN);
      const user = await Tempuser.findOne({
        _id: decoded._id,
        refreshToken,
      });
  
      if (!user) {
        throw new apiError(401, "Invalid refresh token");
      }
  
      req.user = user; // Attach user to the request
      next();
    } catch (error) {
      throw new apiError(403, "Invalid or expired refresh token");
    }
  });
   export default validateOTPRefreshToken