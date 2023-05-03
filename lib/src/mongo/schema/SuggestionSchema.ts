import mongoose from "mongoose";

export interface ISuggestion {
    suggestion_id: number;
    message_id: String;
    creator_id: String;
    status: 'waiting' | 'approved' | 'denied' | 'considered' | 'added';
    rating: Number;
    content: String;
    discussion_thread_id?: string;
    handler_id?: string;
    date_unix: Number;
}

let SuggestionSchema = new mongoose.Schema<ISuggestion>({
    content: { type: String, required: true },
    creator_id: { type: String, required: true },
    rating: { type: Number, default: 0 },
    suggestion_id: { type: Number, default: 0, required: true },
    message_id: { type: String, required: true },
    status: { type: String, required: true },
    date_unix: { type: Number, required: true, default: Date.now() },
    handler_id: { type: String },
    discussion_thread_id: { type: String }
});
export default SuggestionSchema;
