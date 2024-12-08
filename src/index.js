import dotenv from 'dotenv'
import connectDB from "./DB/index.js";
import  app  from './app.js';
import { startSMTPServer } from './smtp.js';
import sendTestEmail from './Utils/TestEmail.js';

dotenv.config({ path: ".env" });
// console.log("Connecting to MongoDB with URI:", process.env.MONGODB_URI);
// const port = process.env.PORT || 4001;
connectDB()
.then(()=>{
  app.listen(process.env.PORT,()=>{
    console.log(`Server is running ☀️ ,at port ${process.env.PORT}`);
  })

  // startSMTPServer()

  // setTimeout(()=>{
  //   sendTestEmail().catch(console.error);
  // },1000)
})
.catch((err)=>{
  console.log("MongoDB connection error !!! ",err);
  
})