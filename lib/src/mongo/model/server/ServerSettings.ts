import mongoose from 'mongoose';
import { APIEmbed } from 'discord.js';
import SuggestionReactionSchema, { ISuggestionReaction } from '../../schema/SuggestionReactionSchema';
import { ILevelReward, LevelRewardSchema } from '../../schema/LevelRewardSchema';
import {
   DEFAULT_JOIN_DM_EMBED,
   DEFAULT_JOIN_EMBED,
   DEFAULT_LEAVE_EMBED,
   DEFAULT_LEVELUP_EMBED,
   DEFAULT_SUGGESTION_EMBED,
   DEFAULT_SUGGESTION_UPDATE_EMBED,
} from '@util/constants/DefaultEmbeds';
import { testLimit } from '@util/functions/testLimit';
import Limits from '@util/types/enums/Limits';

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
      default: DEFAULT_JOIN_EMBED,
   },
   join_dm_embed: {
      type: Object,
      default: DEFAULT_JOIN_DM_EMBED,
   },
   leave_embed: {
      type: Object,
      default: DEFAULT_LEAVE_EMBED,
   },
   join_text: { type: String, default: 'Somebody joined the server!' },
   join_dm_text: { type: String, default: 'Welcome!' },
   leave_text: { type: String, default: 'Somebody left the server!' },
   join_roles: {
      type: [String],
      default: [],
      validate: {
         validator: (v) => testLimit(v, Limits.JOIN_ROLE_DEFAULT_LIMIT),
         message: () => `You have reached the limit of join roles!`,
      },
   },
   sticky_roles: {
      type: [String],
      default: [],
      validate: {
         validator: (v) => testLimit(v, Limits.STICKY_ROLE_DEFAULT_LIMIT),
         message: () => `You have reached the limit of sticky roles!`,
      },
   },
   level_rewards: {
      type: [LevelRewardSchema],
      default: [],
      validate: {
         validator: (v) => testLimit(v, Limits.LEVEL_REWARDS_DEFAULT_LIMIT),
         message: () => `You have reached the limit of level rewards!`,
      },
   },
   levelup_embed: {
      type: Object,
      default: DEFAULT_LEVELUP_EMBED,
   },
   message_xp: { type: Number, default: 20 },
   suggestions_channel: { type: String },
   suggestions_updates_channel: { type: String },
   suggestions_auto_delete: { type: Boolean, default: false },
   suggestions_discussion_threads: { type: Boolean, default: true },
   suggestions_embed: {
      type: Object,
      default: DEFAULT_SUGGESTION_EMBED,
   },
   suggestions_update_embed: {
      type: Object,
      default: DEFAULT_SUGGESTION_UPDATE_EMBED,
   },
   suggestions_reactions: {
      type: [SuggestionReactionSchema],
      default: [
         { emoji: '🔼', rating: 1 },
         { emoji: '🟦', rating: 0 },
         { emoji: '🔽', rating: -1 },
      ],
      validate: {
         validator: (v) => testLimit(v, Limits.SUGGESTIONS_REACTIONS_DEFAULT_LIMIT),
         message: () => `You have reached the limit of suggestions reactions!`,
      },
   },
   disabled_modules: { type: [String], default: [] },
});

const ServerSettings = mongoose.model<IServerSettings>('server_settings', ServerSettingsSchema);
export default ServerSettings;
