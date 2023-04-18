import mongoose from "mongoose";

export interface ICounter {
    _id: string;
    seq: number;
}

let counterSchema = new mongoose.Schema<ICounter>({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
});

let Counter = mongoose.model('counter', counterSchema);
export default Counter;