import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserProfile,
  deleteUser,
  getAllEmails,
} from "../Controller/user.controller.js";
import { verifyJWT } from "../Middelware/auth.middelware.js";
import { registerTempUser } from "../Controller/tempUser.controller.js";
import { requestNewOtp, verifyOtp } from "../Middelware/otp.middelware.js";
import { sendVerificationEmail } from "../Middelware/nodemailer.middelware.js";

const router = Router();


//  testing routes
// router.route("/register").post(registerUser);
// router.route("/register/temp-user").post(registerTempUser)
// router.route("/register/verify-otp/:userId").post(verifyOtp,registerUser)


//final routes
router.route("/register/temp-user").post(registerTempUser,sendVerificationEmail)
router.route("/register/verify-otp").post(verifyOtp,registerUser)
router.route("/register/request-new-otp").post(requestNewOtp)
router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/current-user/:userId/created-email").get(verifyJWT,getAllEmails)
router.route("/update-account-details").patch(verifyJWT,updateUserProfile)
router.route("/delete-user-account").patch(verifyJWT,deleteUser)

export default router;
