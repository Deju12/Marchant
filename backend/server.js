import express from "express"
import dotenv from "dotenv"
import {sql} from "./config/db.js"
import { createTables } from "./models/models.js";
import postRoutes from "./routes/postRoutes.js";
import getRoutes from "./routes/getRoutes.js";
import udRoutes from "./routes/udRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();


const app = express();
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

initDB().then(()=>{
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
});
});


