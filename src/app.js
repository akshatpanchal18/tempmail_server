import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

// cors for middelwares
app.use(cors({
    // origin:process.env.CORS_ORIGIN,
    origin: "https://tempmail-3lr6.onrender.com", 
    credentials:true,

}))
// app.options('*', cors()); // Handle preflight requests for all routes

app.use(express.json({limit:"16kb"}))

// url data fetchin /url encoder
app.use(express.urlencoded({extended:true,limit:"16kb"}))


//to store files
app.use(express.static("public"))

// to access and perform CRUD opt. on cookie
app.use(cookieParser())


//routes import
import userRouter from './Routes/user.routes.js';
import emailRouter from './Routes/email.routes.js'
import inboxRouter from './Routes/inbox.routes.js'
import deleteRouter from './Routes/deletemail.routes.js'

//routes declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/email",emailRouter)
app.use("/api/v1/inbox",inboxRouter)
app.use("/api/v1/delete",deleteRouter)

export default app 