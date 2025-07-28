import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectDB = async () => {
    try {
        const MongooseInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log('MongoDb connected successfully, host: ', MongooseInstance.connections[0].host);
    } catch (error) {
        console.error('Error while connecting with database', error)
        process.exit(1);
    }
}