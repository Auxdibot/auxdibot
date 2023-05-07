import mongoose from "mongoose";

export interface IChange {
    former: string | undefined;
    now: string | undefined;
}

export const ChangeSchema = new mongoose.Schema<IChange>({
    former: {type: String},
    now: {type: String }
}, {_id: false});