import asyncHandeler from "../Utils/asyncHandeler.js";
import apiError from "../Utils/apiError.js";
import apiResponse from "../Utils/apiResponse.js";
import {Tempmail} from '../Models/email.models.js'
import { Inbox } from "../Models/inbox.models.js";
import mongoose,{isValidObjectId} from "mongoose";

const emailDelete = asyncHandeler(async(req,res)=>{
    const emailid = req.params.emailid.trim();


    console.log("TempMaail that to be delete",emailid);
    
    if (!mongoose.isValidObjectId(emailid)) {
        throw new apiError(400, "Invalid email ID");
    }

    const tempEmail = await Tempmail.findById(emailid)

    if(!tempEmail){
        throw new apiError(404,"email not found")
    }
    if (!tempEmail.createdBy.equals(req.user._id)) {
        throw new apiError(403, "You are not allowed to delete this email");
      }

      const searchInbox = await Inbox.find({ 'inbox.to': emailid }) 
      if (!searchInbox){
        throw new apiError(400,"inbox not found");
      }
      console.log("Matching inbox entries to be deleted:", searchInbox);
      
    const deleteInbox = await Inbox.deleteMany({ 'inbox.to': emailid })
    if (deleteInbox.deletedCount === 0) {
        throw new apiError(400, "No inboxes were deleted; deletion failed");
    }

    const email = await Tempmail.findByIdAndDelete(emailid)
    if (!email) {
        throw new apiError(500, "Error while deleting email");
      }



      res.status(200)
      .json(new apiResponse(200,{},"email and inbox deleted successfully"))
})

export {emailDelete}