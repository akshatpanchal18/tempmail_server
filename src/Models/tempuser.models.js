import mongooes,{Schema} from 'mongoose'
import jwt from 'jsonwebtoken'

const tempUserSchema = new Schema({

        username: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
        },
        email: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
        },
        password: {
          type: String,
          required: true,
        },
        otp:{
            type:Number,
            required:true,
        },
        expiresIn:{
          type:Date,
          required: true,
        },
        refreshToken:{
          type:String,
        }
},{timestamps:true})

tempUserSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
      {
          _id: this._id,
          email:this.email
          
      },
      process.env.OTP_REFRESH_TOKEN,
      {
          // expiresIn: process.env.OTP_REFRESH_TOKEN_EXPIRY
          expiresIn: "20m"
      }
  )
  }

export const Tempuser = mongooes.model("Tempuser",tempUserSchema)