import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export class MongooseClient {
    async init() {

        mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/auxdibot").then(() => {
            console.log("Connected to MongoDB!")
        }).catch((err) => {
            console.log("Failed to connect to MongoDB!");
            console.error(err);
        });
    };
}