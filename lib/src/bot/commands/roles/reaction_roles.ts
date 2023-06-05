import { EmbedBuilder, SlashCommandBuilder, ChannelType, GuildMember } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { toAPIEmbed } from '@/interfaces/embeds/EmbedParameters';
import parsePlaceholders from '@/util/parsePlaceholder';
import { getMessage } from '@/util/getMessage';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import emojiRegex from 'emoji-regex';
import createEmbedParameters from '@/util/createEmbedParameters';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import Modules from '@/constants/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction, Reaction } from '@prisma/client';
import { testLimit } from '@/util/testLimit';
import Limits from '@/constants/database/Limits';
import handleError from '@/util/handleError';

const reactionRolesCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('reaction_roles')
      .setDescription('Create, edit, remove, or list the currently active reaction roles.')
      .addSubcommand((builder) =>
         builder
            .setName('add')
            .setDescription('Add a reaction role to the server.')
            .addChannelOption((argBuilder) =>
               argBuilder
                  .setName('channel')
                  .setDescription('The channel to put the reaction role embed in.')
                  .addChannelTypes(ChannelType.GuildText)
                  .setRequired(true),
            )
            .addStringOption((argBuilder) =>
               argBuilder
                  .setName('roles')
                  .setDescription('Space between emoji & role. (ex. [emoji] [role] [...emoji2] [...role2])')
                  .setRequired(true),
            )
            .addStringOption((argBuilder) =>
               argBuilder.setName('title').setDescription('Title of the reaction roles.'),
            ),
      )
      .addSubcommand((builder) =>
         createEmbedParameters(
            builder
               .setName('add_custom')
               .setDescription('Add a reaction role to the server.')
               .addChannelOption((argBuilder) =>
                  argBuilder
                     .setName('channel')
                     .setDescription('The channel to put the reaction role embed in.')
                     .addChannelTypes(ChannelType.GuildText)
                     .setRequired(true),
               )
               .addStringOption((argBuilder) =>
                  argBuilder
                     .setName('roles')
                     .setDescription('Space between emoji & role. (ex. [emoji] [role] [...emoji2] [...role2])')
                     .setRequired(true),
               ),
         ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('add_json')
            .setDescription('Add a reaction role to the server.')
            .addChannelOption((argBuilder) =>
               argBuilder
                  .setName('channel')
                  .setDescription('The channel to put the reaction role embed in.')
                  .addChannelTypes(ChannelType.GuildText)
                  .setRequired(true),
            )
            .addStringOption((argBuilder) =>
               argBuilder
                  .setName('roles')
                  .setDescription('Space between emoji & role. (ex. [emoji] [role] [...emoji2] [...role2])')
                  .setRequired(true),
            )
            .addStringOption((argBuilder) =>
               argBuilder
                  .setName('json')
                  .setDescription('The JSON for the Discord Embed attached to the reaction role.')
                  .setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('remove')
            .setDescription('Remove a reaction role from the server.')
            .addStringOption((argBuilder) =>
               argBuilder.setName('message_id').setDescription('The message id of the reaction role.'),
            )
            .addNumberOption((argBuilder) =>
               argBuilder
                  .setName('index')
                  .setDescription(
                     'The index of the reaction role, which is the placement of the item on /reaction_roles list.',
                  ),
            ),
      )
      .addSubcommand((builder) =>
         createEmbedParameters(
            builder
               .setName('edit')
               .setDescription('Edit a reaction role embed on this server.')
               .addStringOption((argBuilder) =>
                  argBuilder.setName('message_id').setDescription('The message id of the reaction role.'),
               )
               .addNumberOption((argBuilder) =>
                  argBuilder
                     .setName('index')
                     .setDescription(
                        'The index of the reaction role, which is the placement of the item on /reaction_roles list.',
                     ),
               )
               .addStringOption((argBuilder) =>
                  argBuilder
                     .setName('json')
                     .setDescription(
                        'The JSON for the Discord Embed attached to the reaction role. (overrides embed parameters)',
                     ),
               ),
         ),
      )
      .addSubcommand((builder) => builder.setName('list').setDescription('List the reaction roles on this server.')),
   info: {
      module: Modules['Roles'],
      description: 'Create, edit, remove, or list the currently active reaction roles.',
      usageExample: '/reaction_roles (add|remove|edit|list)',
      permission: 'rr',
   },
   subcommands: [
      {
         name: 'add',
         info: {
            module: Modules['Roles'],
            description: 'Add a reaction role to the server.',
            usageExample: '/reaction_roles add (channel) (roles)',
            permission: 'rr.add',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]),
               roles = interaction.options.getString('roles', true),
               title = interaction.options.getString('title') || 'React to receive roles!';
            const split = roles.split(' ');
            const builder = [];
            if (!testLimit(interaction.data.guildData.reaction_roles, Limits.REACTION_ROLE_DEFAULT_LIMIT)) {
               return await handleError(
                  auxdibot,
                  'REACTION_ROLES_LIMIT_EXCEEDED',
                  'There are too many reaction roles!',
                  interaction,
               );
            }
            while (split.length) builder.push(split.splice(0, 2));
            const reactionsAndRoles: Reaction[] = await builder.reduce(
               async (accumulator: Promise<Reaction[]> | Reaction[], item: string[]) => {
                  const arr: Reaction[] = await accumulator;
                  if (!interaction.data) return arr;
                  if (!item[0] || !item[1]) return arr;
                  const role = await interaction.data.guild.roles.fetch((item[1].match(/\d+/) || [])[0] || '');
                  const regex = emojiRegex();
                  const emojis = item[0].match(regex);
                  const emoji =
                     interaction.client.emojis.cache.find((i) => i.toString() == item[0]) ||
                     (emojis != null ? emojis[0] : null);
                  if (emoji && role) {
                     arr.push({ emoji: item[0], role: role.id });
                  }
                  return arr;
               },
               [] as Promise<Reaction[]> | Reaction[],
            );
            if (reactionsAndRoles.length <= 0) {
               return await handleError(
                  auxdibot,
                  'NO_REACTIONS_AND_ROLES_FOUND',
                  'No reactions and roles found! Please use spaces between reactions and roles. (ex. [emoji] [role] [emoji2] [role2] ...)',
                  interaction,
               );
            }
            const embed = new EmbedBuilder().setColor(auxdibot.colors.reaction_role).toJSON();
            embed.title = title;
            embed.description = reactionsAndRoles.reduce(
               (accumulator: string, item, index) =>
                  `${accumulator}\r\n\r\n> **${index + 1})** ${item.emoji} - <@&${item.role}>`,
               '',
            );
            const message = await channel.send({ embeds: [embed] });

            reactionsAndRoles.forEach((item) => message.react(item.emoji));
            await auxdibot.database.servers.update({
               where: { serverID: interaction.data.guildData.serverID },
               data: {
                  reaction_roles: {
                     push: {
                        messageID: message.id,
                        channelID: message.channel.id,
                        reactions: reactionsAndRoles,
                     },
                  },
               },
            });
            const resEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            resEmbed.title = '👈 Created Reaction Role';
            resEmbed.description = `Created a reaction role in ${channel}`;
            handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `Created a reaction role in ${channel.name}`,
               type: LogAction.REACTION_ROLE_ADDED,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [resEmbed] });
         },
      },
      {
         name: 'add_custom',
         info: {
            module: Modules['Roles'],
            description: 'Add a reaction role to the server with custom Embed parameters.',
            usageExample:
               '/reaction_roles add_custom (channel) (roles) [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with `"|d|"``, and seperate fields with `"|s|"`)] [footer] [footer icon url] [image url] [thumbnail url]',
            permission: 'rr.add.custom',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]),
               roles = interaction.options.getString('roles', true),
               content = interaction.options.getString('content')?.replace(/\\n/g, '\n') || '';
            const split = roles.split(' ');
            const builder = [];
            if (!testLimit(interaction.data.guildData.reaction_roles, Limits.REACTION_ROLE_DEFAULT_LIMIT)) {
               return await handleError(
                  auxdibot,
                  'REACTION_ROLES_LIMIT_EXCEEDED',
                  'There are too many reaction roles!',
                  interaction,
               );
            }
            while (split.length) builder.push(split.splice(0, 2));
            const reactionsAndRoles: Reaction[] = await builder.reduce(
               async (accumulator: Promise<Reaction[]> | Reaction[], item: string[]) => {
                  const arr: Reaction[] = await accumulator;
                  if (!interaction.data) return arr;
                  if (!item[0] || !item[1]) return arr;
                  const role = await interaction.data.guild.roles.fetch((item[1].match(/\d+/) || [])[0] || '');
                  const regex = emojiRegex();
                  const emojis = item[0].match(regex);
                  const emoji =
                     interaction.client.emojis.cache.find((i) => i.toString() == item[0]) ||
                     (emojis != null ? emojis[0] : null);
                  if (emoji && role) {
                     arr.push({ emoji: item[0], role: role.id });
                  }
                  return arr;
               },
               [] as Promise<Reaction[]> | Reaction[],
            );
            if (reactionsAndRoles.length <= 0) {
               return await handleError(
                  auxdibot,
                  'NO_REACTIONS_AND_ROLES_FOUND',
                  'No reactions and roles found! Please use spaces between reactions and roles. (ex. [emoji] [role] [emoji2] [role2] ...)',
                  interaction,
               );
            }
            try {
               const parameters = argumentsToEmbedParameters(interaction);
               const message = await channel.send({
                  content: content,
                  embeds: [
                     toAPIEmbed(
                        JSON.parse(
                           await parsePlaceholders(
                              auxdibot,
                              JSON.stringify(parameters),
                              interaction.data.guild,
                              interaction.member as GuildMember | undefined,
                           ),
                        ),
                     ),
                  ],
               });
               reactionsAndRoles.forEach((item) => (message ? message.react(item.emoji) : undefined));
               await auxdibot.database.servers.update({
                  where: { serverID: interaction.data.guildData.serverID },
                  data: {
                     reaction_roles: {
                        push: {
                           messageID: message.id,
                           channelID: message.channel.id,
                           reactions: reactionsAndRoles,
                        },
                     },
                  },
               });
               const resEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
               resEmbed.title = '👈 Created Reaction Role';
               resEmbed.description = `Created a reaction role in ${channel}`;
               handleLog(auxdibot, interaction.data.guild, {
                  userID: interaction.data.member.id,
                  description: `Created a reaction role in ${channel.name}`,
                  type: LogAction.REACTION_ROLE_ADDED,
                  date_unix: Date.now(),
               });
               return await interaction.reply({ embeds: [resEmbed] });
            } catch (x) {
               return await handleError(
                  auxdibot,
                  'EMBED_SEND_ERROR',
                  'There was an error sending that embed!',
                  interaction,
               );
            }
         },
      },
      {
         name: 'add_json',
         info: {
            module: Modules['Roles'],
            description: 'Add a reaction role to the server with custom Discord Embed JSON.',
            usageExample: '/reaction_roles add_json (channel) (roles) (json)',
            permission: 'rr.add.json',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]),
               roles = interaction.options.getString('roles', true),
               json = interaction.options.getString('json', true);
            const split = roles.split(' ');
            const builder = [];
            if (!testLimit(interaction.data.guildData.reaction_roles, Limits.REACTION_ROLE_DEFAULT_LIMIT)) {
               return await handleError(
                  auxdibot,
                  'REACTION_ROLES_LIMIT_EXCEEDED',
                  'There are too many reaction roles!',
                  interaction,
               );
            }
            while (split.length) builder.push(split.splice(0, 2));
            const reactionsAndRoles: Reaction[] = await builder.reduce(
               async (accumulator: Promise<Reaction[]> | Reaction[], item: string[]) => {
                  const arr: Reaction[] = await accumulator;
                  if (!interaction.data) return arr;
                  if (!item[0] || !item[1]) return arr;
                  const role = await interaction.data.guild.roles.fetch((item[1].match(/\d+/) || [])[0] || '');
                  const regex = emojiRegex();
                  const emojis = item[0].match(regex);
                  const emoji =
                     interaction.client.emojis.cache.find((i) => i.toString() == item[0]) ||
                     (emojis != null ? emojis[0] : null);
                  if (emoji && role) {
                     arr.push({ emoji: item[0], role: role.id });
                  }
                  return arr;
               },
               [] as Promise<Reaction[]> | Reaction[],
            );
            if (reactionsAndRoles.length <= 0) {
               return await handleError(
                  auxdibot,
                  'NO_REACTIONS_AND_ROLES_FOUND',
                  'No reactions and roles found! Please use spaces between reactions and roles. (ex. [emoji] [role] [emoji2] [role2] ...)',
                  interaction,
               );
            }

            const message = await channel
               .send({
                  embeds: [
                     JSON.parse(
                        await parsePlaceholders(
                           auxdibot,
                           json || '',
                           interaction.data.guild,
                           interaction.member as GuildMember | undefined,
                        ),
                     ),
                  ],
               })
               .catch(() => undefined);
            if (!message) {
               return await handleError(
                  auxdibot,
                  'EMBED_SEND_ERROR',
                  'There was an error sending that embed!',
                  interaction,
               );
            }
            reactionsAndRoles.forEach((item) => (message ? message.react(item.emoji) : undefined));
            await auxdibot.database.servers.update({
               where: { serverID: interaction.data.guildData.serverID },
               data: {
                  reaction_roles: {
                     push: {
                        messageID: message.id,
                        channelID: message.channel.id,
                        reactions: reactionsAndRoles,
                     },
                  },
               },
            });
            const resEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            resEmbed.title = '👈 Created Reaction Role';
            resEmbed.description = `Created a reaction role in ${channel}`;
            await handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `Created a reaction role in ${channel.name}`,
               type: LogAction.REACTION_ROLE_ADDED,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [resEmbed] });
         },
      },
      {
         name: 'remove',
         info: {
            module: Modules['Roles'],
            description: 'Remove a role that is assigned when a member joins the server.',
            usageExample: '/reaction_roles remove [message_id] [index]',
            permission: 'rr.remove',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const message_id = interaction.options.getString('message_id'),
               index = interaction.options.getNumber('index');
            const server = interaction.data.guildData;
            if (!message_id && !index)
               return await handleError(auxdibot, 'NO_ID_OR_INDEX', 'Please specify a valid ID OR index!', interaction);

            const rr = server.reaction_roles.find((val, valIndex) =>
               message_id ? val.messageID == message_id : index ? valIndex == index - 1 : undefined,
            );
            if (!rr) {
               return await handleError(
                  auxdibot,
                  'REACTION_ROLE_NOT_FOUND',
                  "Couldn't find that reaction role!",
                  interaction,
               );
            }
            const message_channel = rr.channelID ? interaction.data.guild.channels.cache.get(rr.channelID) : undefined;
            const message =
               message_channel && message_channel.isTextBased()
                  ? message_channel.messages.cache.get(rr.messageID)
                  : await getMessage(interaction.data.guild, rr.messageID);

            if (message) {
               await message.delete();
            }
            server.reaction_roles.splice(server.reaction_roles.indexOf(rr), 1);
            await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { reaction_roles: server.reaction_roles },
            });
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.title = '👈 Deleted Reaction Role';
            successEmbed.description = `Deleted a reaction role${message ? ` in ${message.channel}` : ''}.`;
            await handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `Deleted a reaction role${message ? ` in ${message.channel || 'a channel'}` : ''}.`,
               type: LogAction.REACTION_ROLE_REMOVED,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [successEmbed] });
         },
      },
      {
         name: 'list',
         info: {
            module: Modules['Roles'],
            description: 'List the reaction roles on this server.',
            usageExample: '/reaction_roles list',
            permission: 'rr.list',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
            const server = interaction.data.guildData;
            successEmbed.title = '👈 Reaction Roles';
            successEmbed.description = server.reaction_roles.reduce(
               (accumulator: string, value, index) =>
                  `${accumulator}\r\n\r\n**${index + 1})** Message ID: *${
                     value.messageID
                  }* \r\n(${value.reactions.reduce(
                     (acc: string, val2, index) => (index == 0 ? `${val2.emoji}` : `${acc}, ${val2.emoji}`),
                     '',
                  )})`,
               '',
            );
            return await interaction.reply({ embeds: [successEmbed] });
         },
      },
      {
         name: 'edit',
         info: {
            module: Modules['Roles'],
            description: "Edit a reaction role's embed on this server.",
            usageExample:
               '/reaction_roles edit [message_id] [index] [json, overrides embed parameters] [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with `"|d|"``, and seperate fields with `"|s|"`)] [footer] [footer icon url] [image url] [thumbnail url]',
            permission: 'rr.edit',
         },
         async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const messageID = interaction.options.getString('message_id'),
               index = interaction.options.getNumber('index'),
               json = interaction.options.getString('json'),
               content = interaction.options.getString('content');
            const server = interaction.data.guildData;
            if (!messageID && !index)
               return await handleError(auxdibot, 'NO_ID_OR_INDEX', 'Please specify a valid ID OR index!', interaction);
            const rr = server.reaction_roles.find((val, valIndex) =>
               messageID ? val.messageID == messageID : index ? valIndex == index - 1 : undefined,
            );
            if (!rr) {
               return await handleError(
                  auxdibot,
                  'REACTION_ROLE_NOT_FOUND',
                  "Couldn't find that reaction role!",
                  interaction,
               );
            }
            const message_channel = rr.channelID ? interaction.data.guild.channels.cache.get(rr.channelID) : undefined;
            const message =
               message_channel && message_channel.isTextBased()
                  ? message_channel.messages.cache.get(rr.messageID)
                  : await getMessage(interaction.data.guild, rr.messageID);
            if (!message) {
               server.reaction_roles.splice(server.reaction_roles.indexOf(rr), 1);
               await auxdibot.database.servers.update({
                  where: { serverID: server.serverID },
                  data: { reaction_roles: server.reaction_roles },
               });
               return await handleError(
                  auxdibot,
                  'REACTION_ROLE_NO_MESSAGE',
                  'No message for the reaction role found!',
                  interaction,
               );
            }
            if (json) {
               const messageEdit = await message
                  .edit({
                     ...(content ? { content } : {}),
                     embeds: [
                        JSON.parse(
                           await parsePlaceholders(
                              auxdibot,
                              json || '',
                              interaction.data.guild,
                              interaction.member as GuildMember | undefined,
                           ),
                        ),
                     ],
                  })
                  .catch(() => undefined);
               if (!messageEdit) {
                  return await handleError(
                     auxdibot,
                     'EMBED_SEND_ERROR',
                     'There was an error sending that embed!',
                     interaction,
                  );
               }
               const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
               embed.title = '👈 Edited Reaction Role';
               embed.description = `Edited a reaction role${message ? ` in ${message.channel}` : ''}.`;
               await handleLog(auxdibot, interaction.data.guild, {
                  userID: interaction.data.member.id,
                  description: `Edited a reaction role.`,
                  type: LogAction.REACTION_ROLE_EDITED,
                  date_unix: Date.now(),
               });
               return await interaction.reply({ embeds: [embed] });
            }

            try {
               const parameters = argumentsToEmbedParameters(interaction);
               const messageEdit = await message
                  .edit({
                     ...(content ? { content } : {}),
                     embeds: [
                        toAPIEmbed(
                           JSON.parse(
                              await parsePlaceholders(
                                 auxdibot,
                                 JSON.stringify(parameters),
                                 interaction.data.guild,
                                 interaction.member as GuildMember | undefined,
                              ),
                           ),
                        ),
                     ],
                  })
                  .catch(() => undefined);
               if (!messageEdit) {
                  return await handleError(
                     auxdibot,
                     'EMBED_SEND_ERROR',
                     'There was an error sending that embed!',
                     interaction,
                  );
               }
               const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
               embed.title = '👈 Edited Reaction Role';
               embed.description = `Edited a reaction role${message ? ` in ${message.channel}` : ''}.`;
               handleLog(auxdibot, interaction.data.guild, {
                  userID: interaction.data.member.id,
                  description: `Edited a reaction role.`,
                  type: LogAction.REACTION_ROLE_EDITED,
                  date_unix: Date.now(),
               });
               return await interaction.reply({ embeds: [embed] });
            } catch (x) {
               return await handleError(
                  auxdibot,
                  'EMBED_SEND_ERROR',
                  'There was an error sending that embed!',
                  interaction,
               );
            }
         },
      },
   ],
   async execute() {
      return;
   },
};
module.exports = reactionRolesCommand;
