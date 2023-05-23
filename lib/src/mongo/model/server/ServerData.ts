import LogSchema, { ILog } from '@schemas/LogSchema';
import PunishmentSchema, { IPunishment } from '@schemas/PunishmentSchema';
import PermissionOverrideSchema, { IPermissionOverride } from '@schemas/PermissionOverrideSchema';
import ReactionRoleSchema, { IReactionRole } from '@schemas/ReactionRoleSchema';
import mongoose from 'mongoose';
import SuggestionSchema, { ISuggestion } from '@schemas/SuggestionSchema';
import { APIEmbed, Guild, GuildBasedChannel } from 'discord.js';
import { getMessage } from '@util/functions/getMessage';
import parsePlaceholders from '@util/functions/parsePlaceholder';
import { SuggestionsColors } from '@util/constants/Colors';
import { testLimit } from '@util/functions/testLimit';
import Limits from '@util/types/enums/Limits';
import StarredMessageSchema, { IStarredMessage } from '@schemas/StarredMessageSchema';

export interface IServerData {
   server_id: mongoose.ObjectId;
   latest_log: ILog;
   punishments: IPunishment[];
   permission_overrides: IPermissionOverride[];
   reaction_roles: IReactionRole[];
   suggestions: ISuggestion[];
   starred_messages: IStarredMessage[];
}
export interface IServerDataMethods {
   userRecord(user_id: string): IPunishment[];
   checkExpired(): IPunishment[];
   getPunishment(user_id: string, type?: 'warn' | 'kick' | 'mute' | 'ban'): IPunishment | undefined;
   getPermissionOverride(permission?: string, role_id?: string, user_id?: string): IPermissionOverride[];
   removeSuggestion(suggestion_id: number): ISuggestion;
   updateSuggestion(guild: Guild, suggestion: ISuggestion): Promise<boolean>;
}
export type IServerDataModel = mongoose.Model<IServerData, unknown, IServerDataMethods>;

export const ServerDataSchema = new mongoose.Schema<IServerData, IServerDataModel>({
   punishments: {
      type: [PunishmentSchema],
      default: [],
      validate: {
         validator: (v) => testLimit(v, Limits.ACTIVE_PUNISHMENTS_DEFAULT_LIMIT, true),
         message: () => `You have reached the limit of active punishments!`,
      },
   },
   permission_overrides: {
      type: [PermissionOverrideSchema],
      default: [],
      validate: {
         validator: (v) => testLimit(v, Limits.PERMISSION_OVERRIDES_DEFAULT_LIMIT),
         message: () => `You have reached the limit of permission overrides!`,
      },
   },
   latest_log: { type: LogSchema },
   reaction_roles: {
      type: [ReactionRoleSchema],
      default: [],
      validate: {
         validator: (v) => testLimit(v, Limits.REACTION_ROLE_DEFAULT_LIMIT),
         message: () => `You have reached the limit of reaction roles!`,
      },
   },
   suggestions: {
      type: [SuggestionSchema],
      default: [],
      validate: {
         validator: (v) => testLimit(v, Limits.ACTIVE_SUGGESTIONS_DEFAULT_LIMIT, true),
         message: () => `You have reached the limit of active suggestions!`,
      },
   },
   starred_messages: {
      type: [StarredMessageSchema],
      default: [],
      validate: {
         validator: (v) => testLimit(v, Limits.ACTIVE_STARRED_MESSAGES_DEFAULT_LIMIT, true),
         message: () => `You have reached the limit of active starred messages!`,
      },
   },
   server_id: { type: mongoose.Schema.Types.ObjectId, ref: 'server', required: true },
});
ServerDataSchema.method('getPunishment', function (user_id: string, type?: 'warn' | 'kick' | 'mute' | 'ban') {
   return this.punishments
      .reverse()
      .filter(
         (punishment: IPunishment) =>
            (type ? punishment.type == type : true) && !punishment.expired && punishment.user_id == user_id,
      )[0];
});
ServerDataSchema.method('userRecord', function (user_id: string): IPunishment[] {
   return this.punishments.filter((punishment: IPunishment) => punishment.user_id == user_id);
});
ServerDataSchema.method('checkExpired', function () {
   const expired = [];
   for (const punishment of this.punishments) {
      if (!punishment.expired && punishment.expires_date_unix && punishment.expires_date_unix * 1000 > Date.now()) {
         punishment.expired = true;
         expired.push(punishment);
      }
   }
   this.save();
   return expired;
});
ServerDataSchema.method('getPermissionOverride', function (permission?: string, role_id?: string, user_id?: string) {
   return this.permission_overrides.filter((override: IPermissionOverride) => {
      const split = override.permission.split('.');
      return (
         (permission
            ? split[split.length - 1] == '*'
               ? split.slice(0, split.length - 1).join('.') ==
                 permission
                    .split('.')
                    .slice(0, split.length - 1)
                    .join('.')
               : permission == override.permission
            : true) &&
         ((role_id ? override.role_id == role_id : false) || (user_id ? override.user_id == user_id : false))
      );
   });
});
ServerDataSchema.method('removeSuggestion', function (suggestion_id: number) {
   const findSuggestion = this.suggestions.find((suggestion: ISuggestion) => suggestion.suggestion_id == suggestion_id);

   this.suggestions.splice(this.suggestions.indexOf(findSuggestion), 1);
   this.save();
   return findSuggestion;
});
ServerDataSchema.method('updateSuggestion', async function (guild: Guild, suggestion: ISuggestion) {
   const message_channel: GuildBasedChannel | undefined = suggestion.channel_id
      ? guild.channels.cache.get(suggestion.channel_id)
      : undefined;
   const message = suggestion.message_id
      ? message_channel && message_channel.isTextBased()
         ? message_channel.messages.cache.get(suggestion.message_id)
         : await getMessage(guild, suggestion.message_id)
      : undefined;
   if (!message) return false;
   const settings = await this.populate('server_id')
      .then(async (doc: any) => await doc.server_id.fetchSettings())
      .catch(() => undefined);
   const embed: APIEmbed = JSON.parse(
      await parsePlaceholders(
         JSON.stringify(settings.suggestions_embed),
         guild,
         guild.members.cache.get(suggestion.creator_id) || undefined,
         suggestion,
      ),
   ) as APIEmbed;
   embed.color = SuggestionsColors[suggestion.status];
   return message
      .edit({ embeds: [embed] })
      .then(() => true)
      .catch(() => false);
});
const ServerData = mongoose.model<IServerData, IServerDataModel>('server_data', ServerDataSchema);
export default ServerData;
