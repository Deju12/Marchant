import express, { request } from "express"
import dotenv from "dotenv"
import {sql} from "./config/db.js"
import { createTables } from "./models/models.js";
import postRoutes from "./routes/postRoutes.js";
import getRoutes from "./routes/getRoutes.js";
import udRoutes from "./routes/udRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import requestOtpRoutes from "./routes/request_otp.js";
import verifyOtpRoutes from "./routes/verify_otp.js";
import otp from "./routes/otp.js"
import pinset from "./routes/pinset.js";
import loginRoutes from "./routes/loginRoutes.js";
import change_pin from "./routes/change_pin.js";
import deOtp from "./routes/deOtp.js";
import cors from 'cors';

dotenv.config();


const app = express();
app.use(cors()); 
const PORT = process.env.PORT || 3000;

app.use(express.json());

async function initDB(){
    try {
       await createTables(sql);
       console.log("databse initialy succesfully")
       
    } catch (error) {
        console.log("error at initialing DB",error);
        process.exit(1);
    }
}
app.use("/api", postRoutes);
app.use("/api", getRoutes);
app.use("/api", udRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", requestOtpRoutes);
app.use("/api", verifyOtpRoutes);
app.use("/api", otp);
app.use("/api", pinset);
app.use("/api", loginRoutes);
app.use("/api", deOtp);
app.use("/api", change_pin);


initDB().then(()=>{
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
});
});


