import LogSchema, { ILog } from '../../schema/LogSchema';
import punishmentSchema, { IPunishment } from '../../schema/PunishmentSchema';
import PermissionOverrideSchema, { IPermissionOverride } from '../../schema/PermissionOverrideSchema';
import ReactionRoleSchema, { IReactionRole } from '../../schema/ReactionRoleSchema';
import mongoose from 'mongoose';
import SuggestionSchema, { ISuggestion } from '../../schema/SuggestionSchema';
import { APIEmbed, Guild, GuildBasedChannel } from 'discord.js';
import { getMessage } from '../../../util/functions/getMessage';
import parsePlaceholders from '../../../util/functions/parsePlaceholder';
import { SuggestionsColors } from '../../../util/constants/Colors';

export interface IServerData {
   server_id: mongoose.ObjectId;
   latest_log: ILog;
   punishments: IPunishment[];
   permission_overrides: IPermissionOverride[];
   reaction_roles: IReactionRole[];
   suggestions: ISuggestion[];
}
export interface IServerDataMethods {
   updateLog(log: ILog): boolean;
   userRecord(user_id: string): IPunishment[];
   checkExpired(): IPunishment[];
   addPunishment(punishment: IPunishment): IPunishment;
   getPunishment(user_id: string, type?: 'warn' | 'kick' | 'mute' | 'ban'): IPunishment | undefined;
   addPermissionOverride(permissionOverride: IPermissionOverride): IPermissionOverride;
   removePermissionOverride(index: number): boolean;
   getPermissionOverride(permission?: string, role_id?: string, user_id?: string): IPermissionOverride[];
   addReactionRole(reaction_role: IReactionRole): boolean;
   removeReactionRole(index: number): boolean;
   addSuggestion(suggestion: ISuggestion): ISuggestion;
   removeSuggestion(suggestion_id: number): ISuggestion;
   updateSuggestion(guild: Guild, suggestion: ISuggestion): Promise<boolean>;
}
export type IServerDataModel = mongoose.Model<IServerData, unknown, IServerDataMethods>;

export const ServerDataSchema = new mongoose.Schema<IServerData, IServerDataModel>({
   punishments: { type: [punishmentSchema], default: [] },
   permission_overrides: { type: [PermissionOverrideSchema], default: [] },
   latest_log: { type: LogSchema },
   reaction_roles: { type: [ReactionRoleSchema], default: [] },
   suggestions: { type: [SuggestionSchema], default: [] },
   server_id: { type: mongoose.Schema.Types.ObjectId, ref: 'server', required: true },
});
ServerDataSchema.method('updateLog', function (log: ILog) {
   this.latest_log = log;
   return true;
});
ServerDataSchema.method('getPunishment', function (user_id: string, type?: 'warn' | 'kick' | 'mute' | 'ban') {
   return this.punishments
      .reverse()
      .filter(
         (punishment: IPunishment) =>
            (type ? punishment.type == type : true) && !punishment.expired && punishment.user_id == user_id,
      )[0];
});
ServerDataSchema.method('addPunishment', function (punishment: IPunishment) {
   this.punishments.push(punishment);
   this.save();
   return punishment;
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
ServerDataSchema.method('addPermissionOverride', function (permissionOverride: IPermissionOverride) {
   this.permission_overrides.push(permissionOverride);
   this.save();
   return permissionOverride;
});
ServerDataSchema.method('removePermissionOverride', function (index: number) {
   this.permission_overrides.splice(index, 1);
   this.save();
   return true;
});
ServerDataSchema.method('addReactionRole', function (reaction_role: IReactionRole) {
   this.reaction_roles.push(reaction_role);
   this.save();
   return true;
});
ServerDataSchema.method('removeReactionRole', function (index: number) {
   this.reaction_roles.splice(index, 1);
   this.save();
   return true;
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
ServerDataSchema.method('addSuggestion', function (suggestion: ISuggestion) {
   this.suggestions.push(suggestion);
   this.save();
   return suggestion;
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
