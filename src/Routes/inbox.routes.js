import { Router } from "express";
import { verifyJWT } from "../Middelware/auth.middelware.js";
import { deleteAllInbox, getInbox,addMessageToInbox, toggelRead, getInboxes} from '../Controller/inbox.controller.js'


const router = Router()
//create inbox
router.route("/inbox-data/inbox").post(addMessageToInbox)

//get all inbox
router.route("/inbox-data/mail/:mailid").get(verifyJWT,getInbox)
router.route("/inbox-data/mail/inboxes").post(verifyJWT,getInboxes)

//isRead Toggel
router.route("/inbox-data").patch(verifyJWT,toggelRead)

//delete all inbox
router.route("/delete-all/:mailid").delete(verifyJWT,deleteAllInbox)

export default router