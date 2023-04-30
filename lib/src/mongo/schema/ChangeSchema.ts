import mongoose from "mongoose";

export interface IChange {
    former: string | undefined;
    now: string;
}

export const ChangeSchema = new mongoose.Schema<IChange>({
    former: {type: String},
    now: {type: String, required: true}
}, {_id: false});