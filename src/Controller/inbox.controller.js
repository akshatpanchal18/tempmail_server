import asyncHandler from "../Utils/asyncHandeler.js";
import apiError from "../Utils/apiError.js";
import apiResponse from "../Utils/apiResponse.js";
import { Inbox } from "../Models/inbox.models.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Tempmail } from "../Models/email.models.js";

const addMessageToInbox = asyncHandler(async (req, res) => {
console.log(req.body.From);
// console.log(req.body?.recipient);
    const { recipient, From, "subject":sub='', 'stripped-text': body='','stripped-html':link } = req.body;
    // console.log("To:",recipient);
    // console.log("from",sender);
    // console.log("Sub:",sub);
    // console.log("Body:",body);
    const parser = new DOMParser();
const doc = parser.parseFromString(link, 'text/html');
const links = [...doc.querySelectorAll('a')].map(link => link.href);
console.log(links);


    if ([recipient, From, sub,body].some((field) => !field?.trim())) {
        throw new apiError(400, "All fields are required");
    }
    
    const findEmail = await Tempmail.find({"tempEmail":recipient})
    const mailid = findEmail.length > 0 ? findEmail[0]._id : null
    const from = From||"null";
    const subject = sub||"null";
    const text = body||"null";

    // console.log(mailid);
    // console.log(`Received email from ${from} to ${recipient} with subject: ${subject}`);


    // Validate required fields
    if ([text, from, subject].some((field) => !field?.trim())) {
        throw new apiError(400, "All fields are required");
    }
    // Validate mail ID
    if (!mailid) {
        throw new apiError(400, "Invalid mail ID");
    }
    const inbox = await Inbox.findOne({ "emailId":mailid });
    if (!inbox) {
        throw new apiError(404, "Inbox not found");
    }

    inbox.messages.push({
        from,
        subject,
        text,
    })
    await inbox.save()
    console.log(`Received email on ${recipient}`);

    // res.status(201).json(new apiResponse(201, inbox, "Inbox entry created successfully"));
    res.status(201).json(new apiResponse(201,"Inbox entry created successfully"));
});


const deleteAllInbox = asyncHandler(async (req,res) => {
    const {mailid}=req.params
    if(!mongoose.isValidObjectId(mailid)){
        throw new apiError(400,"inbox is requiered")
    }
    // console.log(mailid);

    const inboxdata = await Inbox.find({'emailId':mailid})

    if (!inboxdata) {
        throw new apiError(400,"inbox does not exist or may deleted")
    }
    console.log("found inboxes:",inboxdata);
    
    const deleteinbox = await Inbox.delete({'emailId':mailid})
    if (!deleteinbox) {
        throw new apiError(400,"something went wrong while deletion inbox")
    }
    console.log("inboxes after dele:",deleteinbox);
    
    res.status(200)
    .json(new apiResponse(200,{},"inbox deleted"))
})


const getInbox = asyncHandler(async (req,res) => {
    const {mailid}=req.params
    if(!mongoose.isValidObjectId(mailid)){
        throw new apiError(400,"inbox is requiered")
    }
    // console.log(mailid);

    const inbox = await Inbox.findOne({ "emailId":mailid }).populate('emailId', 'tempEmail');
    if (!inbox) {
        throw new apiError(404, "Inbox not found");
    }
    console.log("found inboxes:",inbox);
    res.status(200)
    .json(new apiResponse(200,inbox,"Inbox found"))
    
})
const getInboxes = asyncHandler(async (req,res) => {
    try {
        const {mailid}=req.body
        // console.log(mailid);
        
        if(!mongoose.isValidObjectId(mailid)){
            throw new apiError(400,"inbox is requiered")
        }
        // console.log(mailid);
    
        const inbox = await Inbox.findOne({ "emailId":mailid })
        // console.log(inbox)
        // if (!inbox) {
        //     throw new apiError(404, "Inbox not found");
        // }
        // console.log("found inboxes:",inbox);
        console.log("inboxes Found");
        res.status(200)
        .json(new apiResponse(200,inbox,"Inbox found"))
    } catch (error) {
        console.error("Error in getInboxes:", error);
        res.status(500).json(new apiError(500,"Internal Server Error"));
    }
    
})

const toggelRead = asyncHandler(async (req,res) => {
    const {inboxid} = req.body
    console.log(inboxid);
    
    if(!inboxid){
        throw new apiError(400,"id requierd")
    }
    const email = await Inbox.findById(inboxid);
    
    if (!email) {
        throw new apiError(404, "Email not found");
    }

    // Toggle the read status
    email.inbox.isRead = !email.inbox.isRead;
    
    email.save();

    res.status(200)
    .json(new apiResponse(201,email,"toggel success"))
})
export { addMessageToInbox,deleteAllInbox,getInbox,getInboxes,toggelRead };
