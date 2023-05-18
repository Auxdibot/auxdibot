import mongoose from 'mongoose';
export type IReaction = { emoji: string; role: string };
const ReactionSchema = new mongoose.Schema<IReaction>(
   {
      emoji: { type: String, required: true },
      role: { type: String, required: true },
   },
   { _id: false },
);
export interface IReactionRole {
   message_id: string;
   channel_id?: string;
   reactions: IReaction[];
}

const ReactionRoleSchema = new mongoose.Schema<IReactionRole>(
   {
      message_id: { type: String, required: true },
      channel_id: { type: String },
      reactions: { type: [ReactionSchema], required: true },
   },
   { _id: false },
);
export default ReactionRoleSchema;
