import mongoose from "mongoose";

import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const hostInterface = await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`)
        console.log(`MongoDB Client connected ! Host= ${hostInterface.connection.host}`)
    } catch (error) {
        console.log(`Mongo error: ${error}`)
        throw error
    }
}

export default connectDB;