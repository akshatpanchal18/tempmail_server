import asyncHandeler from '../Utils/asyncHandeler.js'
import apiError from '../Utils/apiError.js'
import jwt from 'jsonwebtoken'
import { User } from '../Models/user.models.js'

export const verifyJWT = asyncHandeler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
    if(!token){
        throw new apiError(401,"Unathorized request")
    }
    const decodedTokenInfo = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedTokenInfo?._id).select("-password -refreshToken")
        if (!user){
            throw new apiError(401,"Invalid Access Token")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401,error?.message||"Invalid access token")
    }
})