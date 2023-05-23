import mongoose from 'mongoose';

export interface IStarredMessage {
   message_id: string;
   starred_message_id: string;
}

export const StarredMessageSchema = new mongoose.Schema<IStarredMessage>(
   {
      message_id: { type: String },
      starred_message_id: { type: String },
   },
   { _id: false },
);
export default StarredMessageSchema;
