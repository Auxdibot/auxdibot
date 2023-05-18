import mongoose from 'mongoose';
import SuggestionState from '@util/types/enums/SuggestionState';

export interface ISuggestion {
   suggestion_id: number;
   message_id?: string;
   channel_id?: string;
   creator_id: string;
   status: SuggestionState;
   rating: number;
   content: string;
   discussion_thread_id?: string;
   handler_id?: string;
   date_unix: number;
   handled_reason?: string;
}

const SuggestionSchema = new mongoose.Schema<ISuggestion>({
   content: { type: String, required: true },
   creator_id: { type: String, required: true },
   rating: { type: Number, default: 0 },
   suggestion_id: { type: Number, default: 0, required: true },
   message_id: { type: String },
   channel_id: { type: String },
   status: { type: Number, required: true },
   date_unix: { type: Number, required: true, default: Date.now() },
   handler_id: { type: String },
   handled_reason: { type: String },
   discussion_thread_id: { type: String },
});
export default SuggestionSchema;
