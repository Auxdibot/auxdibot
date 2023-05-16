import mongoose from "mongoose";

export interface ILevelReward {
    level: number;
    role_id: string;
}

export const LevelRewardSchema = new mongoose.Schema<ILevelReward>({
    level: { type: Number, required: true },
    role_id: { type: String, required: true }
}, {_id: false});