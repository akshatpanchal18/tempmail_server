import Nodemailer from "nodemailer";
import apiResponse from "../Utils/apiResponse.js";
import apiError from "../Utils/apiError.js";

const transporter = Nodemailer.createTransport({
  host: "smtp.gmail.com", // Use Gmail as the service
  port: process.env.SMTP_PORT_GMAIL,
  secure: true,
  auth: {
    user: process.env.GAMIL_USER,
    pass: process.env.GAMIL_PASS,
  },
  //   logger: true, // Enable logger
  //   debug: true,  // Include debug information
});

const sendVerificationEmail = async (req, res, next) => {
  const OTP = req.otp;
  const user = req.user
  console.log("user in nodemailer",user);
  console.log("RefreshToken in nodemailer",user.refreshToken);
  
  const { email } = req.body; // Get email details from the request body

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
console.log("User email that otp ment to sent:",email);
console.log("OTP that sent in email:", OTP);

  try {
    // Send email
    await transporter.sendMail({
      from: '"Temp mail" <tempmailtemp81@gmail.com>', // Sender address
      to: `${email}`, // List of receivers
      subject: "OTP Verification for Your Request",
      text: `We have received a request to verify your identity. Please use the One-Time Password (OTP) below to complete the process.

      Your OTP: [${OTP}]

    This OTP is valid for the next 10 minutes. Please do not share it with anyone to ensure the security of your account.

    If you did not request this verification, please disregard this email.`

      //   html: `<p>To verify your account, use the following OTP:</p><h3>${OTP}</h3>
      //          <p>Or click the link below to verify your email:</p>`
    });
    const options = {
      httpOnly: true,
      secure: true,
      // secure: false,
      sameSite: 'None',
    };

    console.log(`Email sent to: ${email} successfully ${OTP}`);
    res.status(200)
    .cookie('refreshToken',user.refreshToken,options)
    .json(new apiResponse(201,"email sent successfully"))
    console.log("cookie has been set");
    
  } catch (error) {
    console.error("Error sending email:", error.message); // Log the full error
    // res.status(500)
    // .json(new apiError(500, "Failed to send email"))
  }
};

export { sendVerificationEmail };
