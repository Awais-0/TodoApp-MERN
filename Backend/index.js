import dotenv from "dotenv";
import { connectDB } from "./src/db/connect.js";
import { App } from "./src/app.js";

dotenv.config();

connectDB().
then(()=>{
    App.listen(process.env.PORT, ()=>{
        console.log(`Server currently running on http://localhost:${process.env.PORT}`);
    })
}).
catch((err)=>{
    console.log('Database connection failed: ', err);
})