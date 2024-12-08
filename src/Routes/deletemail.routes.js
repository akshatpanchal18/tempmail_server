import { Router } from "express";
import { verifyJWT } from "../Middelware/auth.middelware.js";
import { emailDelete } from "../Controller/deletemail.controller.js";

const router = Router()

router.route("/delete-email-address/:emailid").delete(verifyJWT,emailDelete)

export default router