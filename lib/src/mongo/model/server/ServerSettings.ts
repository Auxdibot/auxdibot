import mongoose from 'mongoose';
import { APIEmbed } from 'discord.js';
import SuggestionReactionSchema, { ISuggestionReaction } from '../../schema/SuggestionReactionSchema';
import { ILevelReward, LevelRewardSchema } from '../../schema/LevelRewardSchema';

export interface IServerSettings {
   _id: mongoose.ObjectId;
   server_id: mongoose.ObjectId;
   mute_role?: string;
   log_channel?: string;
   join_leave_channel?: string;
   join_embed?: APIEmbed;
   join_dm_embed?: APIEmbed;
   leave_embed?: APIEmbed;
   join_text?: string;
   join_dm_text?: string;
   leave_text?: string;
   join_roles: string[];
   sticky_roles: string[];
   level_rewards: ILevelReward[];
   levelup_embed: APIEmbed;
   message_xp: number;
   suggestions_channel?: string;
   suggestions_updates_channel?: string;
   suggestions_auto_delete: boolean;
   suggestions_reactions: ISuggestionReaction[];
   suggestions_embed?: APIEmbed;
   suggestions_update_embed?: APIEmbed;
   suggestions_discussion_threads: boolean;
   disabled_modules: string[];
}

export const ServerSettingsSchema = new mongoose.Schema<IServerSettings>({
   server_id: { type: mongoose.Schema.Types.ObjectId, ref: 'server', required: true },
   mute_role: { type: String },
   log_channel: { type: String },
   join_leave_channel: { type: String },
   join_embed: {
      type: Object,
      default: {
         type: 'rich',
         title: '👋 Member joined! (%server_members% members.)',
         thumbnail: { url: '%member_avatar_128%' },
         footer: { text: '%server_name%' },
         description: '%member_mention% joined the server.',
         color: 9159498,
         author: { name: '%message_date%' },
      },
   },
   join_dm_embed: {
      type: Object,
      default: {
         type: 'rich',
         title: '👋 Welcome to %server_name%!',
         thumbnail: { url: '%server_icon_128%' },
         footer: { text: '%server_name%' },
         description: 'Welcome, %member_mention%! We hope you enjoy our server.',
         color: 9159498,
         author: { name: '%message_date%' },
      },
   },
   leave_embed: {
      type: Object,
      default: {
         type: 'rich',
         title: '👋 Member left! (%server_members% members.)',
         thumbnail: { url: '%member_avatar_128%' },
         footer: { text: '%server_name%' },
         description: '%member_mention% left the server.',
         color: 16007990,
         author: { name: '%message_date%' },
      },
   },
   join_text: { type: String, default: 'Somebody joined the server!' },
   join_dm_text: { type: String, default: 'Welcome!' },
   leave_text: { type: String, default: 'Somebody left the server!' },
   join_roles: { type: [String], default: [] },
   sticky_roles: { type: [String], default: [] },
   level_rewards: { type: [LevelRewardSchema], default: [] },
   levelup_embed: {
      type: Object,
      default: {
         type: 'rich',
         title: '🏆 Level Up!',
         description: '%member_mention% levelled up.\n\n🏅 Experience: `%member_experience% XP`\n\n🏆 %levelup%',
         color: 15845147,
         author: { name: '%member_tag%', icon_url: '%member_avatar_128%' },
      },
   },
   message_xp: { type: Number, default: 20 },
   suggestions_channel: { type: String },
   suggestions_updates_channel: { type: String },
   suggestions_auto_delete: { type: Boolean, default: false },
   suggestions_discussion_threads: { type: Boolean, default: true },
   suggestions_embed: {
      type: Object,
      default: {
         type: 'rich',
         title: 'Suggestion #%suggestion_id%',
         footer: { text: '👍 Rating: %suggestion_rating%' },
         description: '🕰️ Date: %suggestion_date_formatted%\n%suggestion_state%',
         fields: [{ value: '%suggestion_content%', name: 'Suggestion', inline: false }],
         color: 6052956,
         author: { name: '%member_tag%', icon_url: '%member_avatar_128%' },
      },
   },
   suggestions_update_embed: {
      type: Object,
      default: {
         type: 'rich',
         title: '%suggestion_state% Suggestion #%suggestion_id%',
         footer: { text: '👍 Rating: %suggestion_rating%' },
         fields: [{ value: '%suggestion_handled_reason%', name: 'Reason', inline: false }],
         description:
            '🕰️ Date: %suggestion_date_formatted%\n🧍 Handled by: %suggestion_handler_mention% \n\n%suggestion_content%',
         color: 6052956,
         author: { name: '%member_tag%', icon_url: '%member_avatar_128%' },
      },
   },
   suggestions_reactions: {
      type: [SuggestionReactionSchema],
      default: [
         { emoji: '🔼', rating: 1 },
         { emoji: '🟦', rating: 0 },
         { emoji: '🔽', rating: -1 },
      ],
   },
   disabled_modules: { type: [String], default: [] },
});

const ServerSettings = mongoose.model<IServerSettings>('server_settings', ServerSettingsSchema);
export default ServerSettings;
