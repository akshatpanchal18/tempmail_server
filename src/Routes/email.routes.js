import { Router } from "express";
import { verifyJWT } from "../Middelware/auth.middelware.js";
import {emailCreate} from '../Controller/email.controller.js'

const router = Router();

router.route("/create-email").post(verifyJWT, emailCreate);
// router.route("/delete-email/:emailid").delete(verifyJWT, emailDelete);

export default router