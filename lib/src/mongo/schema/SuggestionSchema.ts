import mongoose from "mongoose";
import SuggestionState from "../../util/types/SuggestionState";

export interface ISuggestion {
    suggestion_id: number;
    message_id?: string;
    creator_id: string;
    status: SuggestionState;
    rating: number;
    content: string;
    discussion_thread_id?: string;
    handler_id?: string;
    date_unix: number;
}

let SuggestionSchema = new mongoose.Schema<ISuggestion>({
    content: { type: String, required: true },
    creator_id: { type: String, required: true },
    rating: { type: Number, default: 0 },
    suggestion_id: { type: Number, default: 0, required: true },
    message_id: { type: String, required: true },
    status: { type: Number, required: true },
    date_unix: { type: Number, required: true, default: Date.now() },
    handler_id: { type: String },
    discussion_thread_id: { type: String }
});
export default SuggestionSchema;
