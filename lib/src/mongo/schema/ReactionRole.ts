import mongoose from "mongoose";
export type IReaction = { emoji: string, role: string };
let ReactionSchema = new mongoose.Schema<IReaction>({
    emoji: { type: String, required: true },
    role: { type: String, required: true }
})
export interface IReactionRole {
    message_id: string;
    reactions: IReaction[];
}

const ReactionRoleSchema = new mongoose.Schema<IReactionRole>({
    message_id: { type: String, required: true },
    reactions: { type: [ReactionSchema], required: true },
})
export default ReactionRoleSchema;