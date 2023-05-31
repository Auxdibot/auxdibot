import { IStarredMessage } from './../../schema/StarredMessageSchema';
import * as mongoose from 'mongoose';
import ServerData, { IServerData, IServerDataMethods } from './ServerData';
import { HydratedDocument } from 'mongoose';
import ServerMember, { IServerMember, IServerMemberMethods } from './ServerMember';
import ServerSettings, { IServerSettings } from './ServerSettings';
import ServerCounter, { IServerCounter, IServerCounterMethods } from './ServerCounter';
import { ILog } from '../../schema/LogSchema';
import Embeds from '@/config/embeds/Embeds';
import {
   APIEmbed,
   Collection,
   EmbedBuilder,
   EmbedField,
   Guild,
   GuildBasedChannel,
   GuildMember,
   LimitedCollection,
   PermissionsBitField,
} from 'discord.js';
import { IPunishment, PunishmentNames, toEmbedField } from '../../schema/PunishmentSchema';
import { LogNames } from '@/config/Log';
import { ISuggestion } from '../../schema/SuggestionSchema';
import { IReactionRole } from '@/mongo/schema/ReactionRoleSchema';
import { IPermissionOverride } from '@/mongo/schema/PermissionOverrideSchema';
import { ILevelReward } from '@/mongo/schema/LevelRewardSchema';
import { ISuggestionReaction } from '@/mongo/schema/SuggestionReactionSchema';
import { Auxdibot } from '@/interfaces/Auxdibot';

export interface IServer {
   _id: mongoose.ObjectId;
   discord_id: string;
   data?: mongoose.ObjectId;
   members?: mongoose.ObjectId;
   settings?: mongoose.ObjectId;
   counter?: mongoose.ObjectId;
}

export interface IServerMethods {
   fetchData(): Promise<HydratedDocument<IServerData, IServerDataMethods>>;
   fetchMembers(): Promise<HydratedDocument<IServerMember, IServerMemberMethods>>[];
   findOrCreateMember(discord_id: string): Promise<HydratedDocument<IServerMember, IServerMemberMethods>> | undefined;
   fetchSettings(): Promise<HydratedDocument<IServerSettings>>;
   fetchCounter(): Promise<HydratedDocument<IServerCounter, IServerCounterMethods>>;
   log(guild: Guild, log: ILog, use_user_thumbnail?: boolean): Promise<APIEmbed | undefined>;
   recordAsEmbed(user_id: string): Promise<APIEmbed | undefined>;
   createLeaderboard(
      top?: number,
   ):
      | LimitedCollection<HydratedDocument<IServerMember, IServerMemberMethods>, number>
      | Collection<HydratedDocument<IServerMember, IServerMemberMethods>, number>;
   punish(punishment: IPunishment): Promise<APIEmbed | undefined>;
   testPermission(permission: string | undefined, executor: GuildMember, defaultAllowed: boolean): Promise<boolean>;
   addSuggestion(suggestion: ISuggestion): Promise<ISuggestion | { error: string }>;
   addPunishment(suggestion: IPunishment): Promise<IPunishment | { error: string }>;
   addPermissionOverride(suggestion: IPermissionOverride): Promise<IPermissionOverride | { error: string }>;
   addReactionRole(suggestion: IReactionRole): Promise<IReactionRole | { error: string }>;
   addJoinRole(join_role: string): Promise<string | { error: string }>;
   addStickyRole(sticky_role: string): Promise<string | { error: string }>;
   addLevelReward(level_reward: ILevelReward): Promise<ILevelReward | { error: string }>;
   addSuggestionReaction(suggestion_reaction: ISuggestionReaction): Promise<ISuggestionReaction | { error: string }>;
   addStarredMessage(starred_message: IStarredMessage): Promise<IStarredMessage | { error: string }>;
}
export interface IServerModel extends mongoose.Model<IServer, unknown, IServerMethods> {
   findOrCreateServer(discord_id: string): Promise<mongoose.HydratedDocument<IServer, IServerMethods>>;
   deleteByDiscordId(discord_id: string): Promise<mongoose.HydratedDocument<IServer, IServerMethods>>;
}
export const ServerSchema = new mongoose.Schema<IServer, IServerModel>({
   discord_id: { type: String, required: true },
   members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'server_member' }],
   data: { type: mongoose.Schema.Types.ObjectId, ref: 'server_data' },
   settings: { type: mongoose.Schema.Types.ObjectId, ref: 'server_settings' },
   counter: { type: mongoose.Schema.Types.ObjectId, ref: 'server_counter' },
});
/*
   STATICS
*/
ServerSchema.static('findOrCreateServer', async function (discord_id: string) {
   return await this.findOneAndUpdate({ discord_id }, {}, { upsert: true, new: true }).exec();
});
ServerSchema.static('deleteByDiscordId', async function (discord_id: string) {
   return await this.findOneAndDelete({ discord_id })
      .exec()
      .then((doc) => {
         if (!doc) return doc;
         ServerCounter.deleteMany({ server_id: doc._id })
            .exec()
            .catch(() => undefined);
         ServerMember.deleteMany({ server_id: doc._id })
            .exec()
            .catch(() => undefined);
         ServerSettings.deleteMany({ server_id: doc._id })
            .exec()
            .catch(() => undefined);
         ServerData.deleteMany({ server_id: doc._id })
            .exec()
            .catch(() => undefined);
         return doc;
      });
});
/*
   FETCH SUB-DOCUMENT METHODS
*/

ServerSchema.method('fetchData', async function () {
   let data = await this.populate('data')
      .then((doc: any) => doc.data)
      .catch(() => undefined);
   if (!data) {
      data = await ServerData.findOneAndUpdate({ server_id: this._id }, {}, { upsert: true, new: true }).catch(
         () => undefined,
      );
      if (!data) return;
      await data.save({ validateModifiedOnly: true });
      this.data = data._id;
   }
   return data;
});

ServerSchema.method('fetchSettings', async function () {
   let settings = await this.populate('settings')
      .then((doc: any) => doc.settings)
      .catch(() => undefined);
   if (!settings) {
      settings = await ServerSettings.findOneAndUpdate({ server_id: this._id }, {}, { upsert: true, new: true }).catch(
         () => undefined,
      );
      if (!settings) return undefined;
      await settings.save({ validateModifiedOnly: true });
      this.settings = settings._id;
      await this.save({ validateModifiedOnly: true });
   }
   return settings;
});

ServerSchema.method('fetchMembers', async function () {
   return await this.populate('members')
      .then((doc: any) => doc.members)
      .catch(() => undefined);
});

ServerSchema.method('findOrCreateMember', async function (discord_id: string) {
   const members = await this.populate('members')
      .then((doc: any) => doc.members)
      .catch(() => undefined);
   if (members) {
      for (const member of members) {
         if (member.discord_id == discord_id) return member;
      }
      const member = await ServerMember.findOneAndUpdate(
         {
            discord_id: discord_id,
            server_id: this._id,
         },
         {},
         { upsert: true, new: true },
      ).catch(() => undefined);
      if (!member) return undefined;
      return member
         .save({ validateModifiedOnly: true })
         .then(() => {
            if (!member) return undefined;
            this.members.push(member._id);
            this.save({ validateModifiedOnly: true });
            return member;
         })
         .catch(() => undefined);
   }
   return undefined;
});

ServerSchema.method('fetchCounter', async function () {
   let counter = await this.populate('counter')
      .then((doc: any) => doc.counter)
      .catch(() => undefined);
   if (!counter) {
      counter = await ServerCounter.findOneAndUpdate({ server_id: this._id }, {}, { upsert: true, new: true }).catch(
         () => undefined,
      );
      if (!counter) return undefined;
      await counter.save({ validateModifiedOnly: true });
      this.counter = counter._id;
      await this.save({ validateModifiedOnly: true });
   }
   return counter;
});

/*
   ACTION METHODS
*/

ServerSchema.method('log', async function (guild: Guild, log: ILog, use_user_thumbnail?: boolean) {
   const settings = await this.fetchSettings(),
      data = await this.fetchData();
   data.latest_log = log;
   await data.save({ validateModifiedOnly: true });
   if (!guild || !guild.available || !settings.log_channel) return undefined;
   const channel: GuildBasedChannel | undefined = guild.channels.cache.get(settings.log_channel);
   if (!channel || !channel.isTextBased()) return undefined;
   const embed = new EmbedBuilder().setColor((guild.client as Auxdibot).colors.log).toJSON();
   if (use_user_thumbnail && log.user_id) {
      const user = log.punishment
         ? guild.client.users.cache.get(log.punishment.user_id)
         : guild.client.users.cache.get(log.user_id);
      if (user) {
         const avatar = user.avatarURL({ size: 128 });
         embed.thumbnail = avatar ? { url: avatar } : undefined;
      }
   }
   embed.title = `Log | ${LogNames[log.type]}`;
   embed.description = `${log.description}\n\n🕰️ Date: <t:${Math.round(log.date_unix / 1000)}>${
      log.user_id ? `\n🧍 User: <@${log.user_id}>` : ''
   }`;
   embed.fields = [
      log.punishment ? toEmbedField(log.punishment) : undefined,
      log.mute_role
         ? {
              name: 'Mute Role Change',
              value: `Formerly: ${log.mute_role.former ? `<@&${log.mute_role.former}>` : 'None'}\r\n\r\nNow: <@&${
                 log.mute_role.now
              }>`,
              inline: false,
           }
         : undefined,
      log.channel
         ? {
              name: 'Channel Change',
              value: `Formerly: ${log.channel.former ? `<#${log.channel.former}>` : 'None'}\r\n\r\nNow: ${
                 log.channel.now ? `<#${log.channel.now}>` : 'None'
              }`,
              inline: false,
           }
         : undefined,
      log.permission_override
         ? {
              name: 'Permission Override',
              value: `${log.permission_override.allowed ? '✅' : '❎'} \`${log.permission_override.permission}\` - ${
                 log.permission_override.role_id
                    ? `<@&${log.permission_override.role_id}>`
                    : log.permission_override.user_id
                    ? `<@${log.permission_override.user_id}>`
                    : ''
              }`,
              inline: false,
           }
         : undefined,
      log.message_edit
         ? {
              name: 'Message Change',
              value: `Formerly: \r\n\r\n${log.message_edit.former}\r\n\r\nNow: \r\n\r\n${log.message_edit.now}\r\n\r\n`,
              inline: false,
           }
         : undefined,
   ].filter((i) => i) as EmbedField[];
   if (log.punishment) {
      embed.footer = {
         text: `Punishment ID: ${log.punishment.punishment_id}`,
      };
   }
   return await channel
      .send({ embeds: [embed] })
      .then(() => embed)
      .catch(() => undefined);
});

ServerSchema.method('recordAsEmbed', async function (user_id: string) {
   // todo placeholder for when i replace everything with prisma (the color)
   const embed = new EmbedBuilder().setColor(0xfe8a00).toJSON();
   const record = (await this.fetchData()).userRecord(user_id).reverse();
   embed.title = '📜 Record';
   embed.description = `This is the record for <@${user_id}>.\nWant to check more info about a punishment? Do \`/punishment view (id)\`.`;
   embed.fields = [
      {
         name: `Punishments`,
         value: record.reduce((str: string, punishment: IPunishment) => {
            const type = PunishmentNames[punishment.type];
            return (
               str +
               `\n**${type.name}** - PID: ${punishment.punishment_id} - <t:${Math.round(punishment.date_unix / 1000)}>`
            );
         }, '\u2800'),
      },
   ];
   return embed;
});
ServerSchema.method('punish', async function (punishment: IPunishment): Promise<APIEmbed | undefined> {
   const add_punishment = this.addPunishment(punishment);
   if ('error' in add_punishment) {
      const errorEmbed = Embeds.ERROR_EMBED.toJSON();
      errorEmbed.description = add_punishment.error;
      return errorEmbed;
   }
   const embed = new EmbedBuilder().setColor(0x9c0e11).toJSON();
   embed.title = PunishmentNames[punishment.type].name;
   embed.description = `User was ${PunishmentNames[punishment.type].action}.`;
   embed.fields = [toEmbedField(punishment)];
   embed.footer = {
      text: `Punishment ID: ${punishment.punishment_id}`,
   };
   return embed;
});

ServerSchema.method('createLeaderboard', async function (top?: number) {
   const members: HydratedDocument<IServerMember, IServerMemberMethods>[] = await this.fetchMembers();
   const leaderboard = members
      .reduce(
         (
            acc: Collection<HydratedDocument<IServerMember, IServerMemberMethods>, number>,
            member: HydratedDocument<IServerMember, IServerMemberMethods>,
         ) => {
            return acc.set(member, member.xp);
         },
         new Collection(),
      )
      .sort((a, b) => b - a);
   return top ? new LimitedCollection({ maxSize: top }, leaderboard) : leaderboard;
});

ServerSchema.method(
   'testPermission',
   async function (permission: string | undefined, executor: GuildMember, defaultAllowed: boolean) {
      if (!permission) return true;
      const data = await this.fetchData();
      if (executor.id == executor.guild.ownerId || executor.permissions.has(PermissionsBitField.Flags.Administrator))
         return true;
      const roles = executor.roles.cache.values();
      const permissionSplit = permission.split('.');
      let permissionToTest = '';
      const accessible = permissionSplit.reduce((accumulator: boolean | undefined, currentValue) => {
         if (accumulator == false) return false;
         permissionToTest = permissionToTest.length == 0 ? currentValue : permissionToTest + '.' + currentValue;
         const overrides = data.getPermissionOverride(permissionToTest, undefined, executor.id);
         if (overrides.length > 0) {
            for (const override of overrides) {
               if (!override.allowed) return false;
            }
            return true;
         }
         for (const role of roles) {
            const overrideRoles = data.getPermissionOverride(permissionToTest, role.id);
            if (overrideRoles.length > 0) {
               for (const override of overrides) {
                  if (!override.allowed) return false;
               }
               return true;
            }
         }
         return accumulator;
      }, undefined);
      return accessible != undefined ? accessible : defaultAllowed;
   },
);
/*
   DATA MODIFY METHODS
*/
ServerSchema.method('addSuggestion', async function (suggestion: ISuggestion) {
   const data: HydratedDocument<IServerData, IServerDataMethods> = await this.fetchData();
   data.suggestions.push(suggestion);
   return await data
      .save({ validateModifiedOnly: true })
      .then(() => suggestion)
      .catch((x) => ({ error: x['errors']['suggestions'].message }));
});
ServerSchema.method('addPunishment', async function (punishment: IPunishment) {
   const data: HydratedDocument<IServerData, IServerDataMethods> = await this.fetchData();
   data.punishments.push(punishment);
   return await data
      .save({ validateModifiedOnly: true })
      .then(() => punishment)
      .catch((x) => ({ error: x['errors']['punishments'].message }));
});
ServerSchema.method('addPermissionOverride', async function (permission_override: IPermissionOverride) {
   const data: HydratedDocument<IServerData, IServerDataMethods> = await this.fetchData();
   data.permission_overrides.push(permission_override);
   return await data
      .save({ validateModifiedOnly: true })
      .then(() => permission_override)
      .catch((x) => ({ error: x['errors']['permission_overrides'].message }));
});
ServerSchema.method('addReactionRole', async function (rr: IReactionRole) {
   const data: HydratedDocument<IServerData, IServerDataMethods> = await this.fetchData();
   data.reaction_roles.push(rr);
   return await data
      .save({ validateModifiedOnly: true })
      .then(() => rr)
      .catch((x) => ({ error: x['errors']['reaction_roles'].message }));
});
ServerSchema.method('addJoinRole', async function (join_role: string) {
   const settings: HydratedDocument<IServerSettings> = await this.fetchSettings();
   settings.join_roles.push(join_role);
   return await settings
      .save({ validateModifiedOnly: true })
      .then(() => join_role)
      .catch((x) => ({ error: x['errors']['join_roles'].message }));
});
ServerSchema.method('addStickyRole', async function (sticky_role: string) {
   const settings: HydratedDocument<IServerSettings> = await this.fetchSettings();
   settings.sticky_roles.push(sticky_role);
   return await settings
      .save({ validateModifiedOnly: true })
      .then(() => sticky_role)
      .catch((x) => ({ error: x['errors']['sticky_roles'].message }));
});
ServerSchema.method('addLevelReward', async function (level_reward: ILevelReward) {
   const settings: HydratedDocument<IServerSettings> = await this.fetchSettings();
   settings.level_rewards.push(level_reward);
   return await settings
      .save({ validateModifiedOnly: true })
      .then(() => level_reward)
      .catch((x) => ({ error: x['errors']['level_rewards'].message }));
});
ServerSchema.method('addSuggestionsReaction', async function (suggestions_reaction: ISuggestionReaction) {
   const settings: HydratedDocument<IServerSettings> = await this.fetchSettings();
   settings.suggestions_reactions.push(suggestions_reaction);
   return await settings
      .save({ validateModifiedOnly: true })
      .then(() => suggestions_reaction)
      .catch((x) => ({ error: x['errors']['suggestions_reactions'].message }));
});
ServerSchema.method('addStarredMessage', async function (starred_message: IStarredMessage) {
   const data: HydratedDocument<IServerData, IServerDataMethods> = await this.fetchData();
   data.starred_messages.push(starred_message);
   return await data
      .save({ validateModifiedOnly: true })
      .then(() => starred_message)
      .catch((x) => ({ error: x['errors']['starred_messages'].message }));
});
const Server = mongoose.model<IServer, IServerModel>('server', ServerSchema);
export default Server;
