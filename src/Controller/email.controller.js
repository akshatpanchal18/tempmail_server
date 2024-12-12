import {Tempmail} from '../Models/email.models.js'
import {Inbox} from '../Models/inbox.models.js'
import asyncHandeler from "../Utils/asyncHandeler.js";
import apiError from "../Utils/apiError.js";
import apiResponse from "../Utils/apiResponse.js";

const emailCreate = asyncHandeler(async(req,res)=>{
    const {tempEmail} = req.body;
    const userId = req.user._id;
   //  console.log("c-email:",tempEmail,"loggedInUser:",userId);
    if(!userId){
        throw new apiError(400,"Please login before use service")
    }
     if(!tempEmail) {
        throw new apiError(400,"tempmail required")
     }

    const existingEmail = await Tempmail.findOne({ tempEmail });
    if (existingEmail) {
        throw new apiError(409, "Temporary email already exists");
    }

     const newEmail = await Tempmail.create({
        createdBy:userId,
        tempEmail
     })

     const newInbox = await Inbox.create({
        emailId:newEmail._id,
        messages:[],
     })

     newEmail.inbox = newInbox._id;
     await newEmail.save()
   //   console.log("New Email Document:", newEmail);
     console.log("New Email created");
    
      return res
      .status(201)
      // .json(new apiResponse(200, {newEmail,newInbox}, "Email Created Successfully"));
      .json(new apiResponse(200, {newEmail}, "Email Created Successfully"));
})

export {emailCreate}