import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

// cors for middelwares
const allowedOrigins = [
    'http://localhost:5173', // Local development
    'https://tempmail-3lr6.onrender.com', // Deployed frontend
];

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error('Not allowed by CORS')); // Deny the request
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    credentials: true, // Allow cookies to be sent with requests
}));
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