import mongoose from "mongoose";

export interface ISuggestionReaction {
    emoji: string;
    rating: number;
}
const SuggestionReactionSchema = new mongoose.Schema<ISuggestionReaction>({
    emoji: { type: String, required: true },
    rating: { type: Number, required: true }
}, { _id: false });
export default SuggestionReactionSchema;