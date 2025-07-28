import dotenv from "dotenv";
import { connectDB } from "./src/db/connect.js";
import { App } from "./src/app.js";

dotenv.config();

const PORT = process.env.PORT || 4000

connectDB().
then(()=>{
    App.listen(PORT, ()=>{
        console.log(`Server currently running on http://localhost:${PORT}`);
    })
}).
catch((err)=>{
    console.log('Database connection failed: ', err);
})