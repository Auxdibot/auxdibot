import { SlashCommandBuilder, APIEmbed, ChannelType, Role, GuildMember } from 'discord.js';
import AuxdibotCommand from '@util/types/templates/AuxdibotCommand';
import { IReaction } from '@schemas/ReactionRoleSchema';
import Embeds from '@util/constants/Embeds';
import { toAPIEmbed } from '@util/types/EmbedParameters';
import parsePlaceholders from '@util/functions/parsePlaceholder';
import { getMessage } from '@util/functions/getMessage';
import AuxdibotCommandInteraction from '@util/types/templates/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@util/types/AuxdibotCommandData';
import { LogType } from '@util/types/enums/Log';
import emojiRegex from 'emoji-regex';
import createEmbedParameters from '@util/functions/createEmbedParameters';
import argumentsToEmbedParameters from '@util/functions/argumentsToEmbedParameters';
import Modules from '@util/constants/Modules';

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
      module: Modules['roles'],
      description: 'Create, edit, remove, or list the currently active reaction roles.',
      usageExample: '/reaction_roles (add|remove|edit|list)',
      permission: 'rr',
   },
   subcommands: [
      {
         name: 'add',
         info: {
            module: Modules['roles'],
            description: 'Add a reaction role to the server.',
            usageExample: '/reaction_roles add (channel) (roles)',
            permission: 'rr.add',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const data = await interaction.data.guildData.fetchData();
            const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]),
               roles = interaction.options.getString('roles', true),
               title = interaction.options.getString('title') || 'React to receive roles!';
            const split = roles.split(' ');
            const builder = [];
            while (split.length) builder.push(split.splice(0, 2));
            type IReactionAndRole = { emoji: string; role: Role };
            const reactionsAndRoles: IReactionAndRole[] = await builder.reduce(
               async (accumulator: Promise<IReactionAndRole[]> | IReactionAndRole[], item: string[]) => {
                  const arr: IReactionAndRole[] = await accumulator;
                  if (!interaction.data) return arr;
                  if (!item[0] || !item[1]) return arr;
                  const role = await interaction.data.guild.roles.fetch((item[1].match(/\d+/) || [])[0] || '');
                  const regex = emojiRegex();
                  const emojis = item[0].match(regex);
                  const emoji =
                     interaction.client.emojis.cache.find((i) => i.toString() == item[0]) ||
                     (emojis != null ? emojis[0] : null);
                  if (emoji && role) {
                     arr.push({ emoji: item[0], role });
                  }
                  return arr;
               },
               [] as Promise<IReactionAndRole[]> | IReactionAndRole[],
            );
            let resEmbed = Embeds.SUCCESS_EMBED.toJSON();
            if (reactionsAndRoles.length <= 0) {
               resEmbed = Embeds.ERROR_EMBED.toJSON();
               resEmbed.description =
                  'No reactions and roles found! Please use spaces between reactions and roles. (ex. [emoji] [role] [emoji2] [role2] ...)';
               return await interaction.reply({ embeds: [resEmbed] });
            }
            const embed = Embeds.REACTION_ROLE_EMBED.toJSON();
            embed.title = title;
            embed.description = reactionsAndRoles.reduce(
               (accumulator: string, item, index) =>
                  `${accumulator}\r\n\r\n> **${index + 1})** ${item.emoji} - <@&${item.role.id}>`,
               '',
            );
            const message = await channel.send({ embeds: [embed] });

            reactionsAndRoles.forEach((item) => message.react(item.emoji));
            data.reaction_roles.push({
               message_id: message.id,
               channel_id: message.channel.id,
               reactions: reactionsAndRoles.map((item) => <IReaction>{ role: item.role.id, emoji: item.emoji }),
            });
            await data.save();
            resEmbed.title = '👈 Created Reaction Role';
            resEmbed.description = `Created a reaction role in ${channel}`;
            await interaction.data.guildData.log(interaction.data.guild, {
               user_id: interaction.data.member.id,
               description: `Created a reaction role in ${channel.name}`,
               type: LogType.REACTION_ROLE_ADDED,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [resEmbed] });
         },
      },
      {
         name: 'add_custom',
         info: {
            module: Modules['roles'],
            description: 'Add a reaction role to the server with custom Embed parameters.',
            usageExample:
               '/reaction_roles add_custom (channel) (roles) [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with `"|d|"``, and seperate fields with `"|s|"`)] [footer] [footer icon url] [image url] [thumbnail url]',
            permission: 'rr.add.custom',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]),
               roles = interaction.options.getString('roles', true),
               content = interaction.options.getString('content')?.replace(/\\n/g, '\n') || '';

            const data = await interaction.data.guildData.fetchData();
            const split = roles.split(' ');
            const builder = [];
            while (split.length) builder.push(split.splice(0, 2));
            const reactionsAndRoles: IReaction[] = await builder.reduce(
               async (accumulator: Promise<IReaction[]> | IReaction[], item: string[]) => {
                  const arr: IReaction[] = await accumulator;
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
               [] as Promise<IReaction[]> | IReaction[],
            );
            let resEmbed = Embeds.SUCCESS_EMBED.toJSON();
            if (reactionsAndRoles.length <= 0) {
               resEmbed = Embeds.ERROR_EMBED.toJSON();
               resEmbed.description =
                  'No reactions and roles found! Please use spaces between reactions and roles. (ex. [emoji] [role] [emoji2] [role2] ...)';
               return await interaction.reply({ embeds: [resEmbed] });
            }
            try {
               const parameters = argumentsToEmbedParameters(interaction);
               const message = await channel.send({
                  content: content,
                  embeds: [
                     toAPIEmbed(
                        JSON.parse(
                           await parsePlaceholders(
                              JSON.stringify(parameters),
                              interaction.data.guild,
                              interaction.member as GuildMember | undefined,
                           ),
                        ),
                     ) as APIEmbed,
                  ],
               });
               reactionsAndRoles.forEach((item) => (message ? message.react(item.emoji) : undefined));
               data.reaction_roles.push({ message_id: message.id, reactions: reactionsAndRoles });
               await data.save();
               resEmbed.title = '👈 Created Reaction Role';
               resEmbed.description = `Created a reaction role in ${channel}`;
               await interaction.data.guildData.log(interaction.data.guild, {
                  user_id: interaction.data.member.id,
                  description: `Created a reaction role in ${channel.name}`,
                  type: LogType.REACTION_ROLE_ADDED,
                  date_unix: Date.now(),
               });
               return await interaction.reply({ embeds: [resEmbed] });
            } catch (x) {
               const embed = Embeds.ERROR_EMBED.toJSON();
               embed.description = `There was an error sending that embed!`;
               return await interaction.reply({ embeds: [embed] });
            }
         },
      },
      {
         name: 'add_json',
         info: {
            module: Modules['roles'],
            description: 'Add a reaction role to the server with custom Discord Embed JSON.',
            usageExample: '/reaction_roles add_json (channel) (roles) (json)',
            permission: 'rr.add.json',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]),
               roles = interaction.options.getString('roles', true),
               json = interaction.options.getString('json', true);
            const data = await interaction.data.guildData.fetchData();
            const split = roles.split(' ');
            const builder = [];
            while (split.length) builder.push(split.splice(0, 2));
            const reactionsAndRoles: IReaction[] = await builder.reduce(
               async (accumulator: Promise<IReaction[]> | IReaction[], item: string[]) => {
                  const arr: IReaction[] = await accumulator;
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
               [] as Promise<IReaction[]> | IReaction[],
            );
            let resEmbed = Embeds.SUCCESS_EMBED.toJSON();
            if (reactionsAndRoles.length <= 0) {
               resEmbed = Embeds.ERROR_EMBED.toJSON();
               resEmbed.description =
                  'No reactions and roles found! Please use spaces between reactions and roles. (ex. [emoji] [role] [emoji2] [role2] ...)';
               return await interaction.reply({ embeds: [resEmbed] });
            }

            const message = await channel
               .send({
                  embeds: [
                     JSON.parse(
                        await parsePlaceholders(
                           json || '',
                           interaction.data.guild,
                           interaction.member as GuildMember | undefined,
                        ),
                     ) as APIEmbed,
                  ],
               })
               .catch(() => undefined);
            if (!message) {
               const embed = Embeds.ERROR_EMBED.toJSON();
               embed.description = `There was an error sending that embed!`;
               return await interaction.reply({ embeds: [embed] });
            }
            reactionsAndRoles.forEach((item) => (message ? message.react(item.emoji) : undefined));
            data.reaction_roles.push({ message_id: message.id, reactions: reactionsAndRoles });
            await data.save();
            resEmbed.title = '👈 Created Reaction Role';
            resEmbed.description = `Created a reaction role in ${channel}`;
            await interaction.data.guildData.log(interaction.data.guild, {
               user_id: interaction.data.member.id,
               description: `Created a reaction role in ${channel.name}`,
               type: LogType.REACTION_ROLE_ADDED,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [resEmbed] });
         },
      },
      {
         name: 'remove',
         info: {
            module: Modules['roles'],
            description: 'Remove a role that is assigned when a member joins the server.',
            usageExample: '/reaction_roles remove [message_id] [index]',
            permission: 'rr.remove',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const message_id = interaction.options.getString('message_id'),
               index = interaction.options.getNumber('index');
            const data = await interaction.data.guildData.fetchData();
            if (!message_id && !index) {
               const embed = Embeds.ERROR_EMBED.toJSON();
               embed.description = `Please include a message_id or index!`;
               return await interaction.reply({ embeds: [embed] });
            }
            const rr = data.reaction_roles.find((val, valIndex) =>
               message_id ? val.message_id == message_id : index ? valIndex == index - 1 : undefined,
            );
            if (!rr) {
               const embed = Embeds.ERROR_EMBED.toJSON();
               embed.description = `Couldn't find that reaction role!`;
               return await interaction.reply({ embeds: [embed] });
            }
            const message_channel = rr.channel_id
               ? interaction.data.guild.channels.cache.get(rr.channel_id)
               : undefined;
            const message =
               message_channel && message_channel.isTextBased()
                  ? message_channel.messages.cache.get(rr.message_id)
                  : await getMessage(interaction.data.guild, rr.message_id);

            if (message) {
               await message.delete();
            }
            data.reaction_roles.splice(data.reaction_roles.indexOf(rr), 1);
            await data.save();
            const successEmbed = Embeds.SUCCESS_EMBED.toJSON();
            successEmbed.title = '👈 Deleted Reaction Role';
            successEmbed.description = `Deleted a reaction role${message ? ` in ${message.channel}` : ''}.`;
            await interaction.data.guildData.log(interaction.data.guild, {
               user_id: interaction.data.member.id,
               description: `Deleted a reaction role${message ? ` in ${message.channel || 'a channel'}` : ''}.`,
               type: LogType.REACTION_ROLE_REMOVED,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [successEmbed] });
         },
      },
      {
         name: 'list',
         info: {
            module: Modules['roles'],
            description: 'List the reaction roles on this server.',
            usageExample: '/reaction_roles list',
            permission: 'rr.list',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const successEmbed = Embeds.INFO_EMBED.toJSON();
            const data = await interaction.data.guildData.fetchData();
            successEmbed.title = '👈 Reaction Roles';
            successEmbed.description = data.reaction_roles.reduce(
               (accumulator: string, value, index) =>
                  `${accumulator}\r\n\r\n**${index + 1})** Message ID: *${
                     value.message_id
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
            module: Modules['roles'],
            description: "Edit a reaction role's embed on this server.",
            usageExample:
               '/reaction_roles edit [message_id] [index] [json, overrides embed parameters] [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with `"|d|"``, and seperate fields with `"|s|"`)] [footer] [footer icon url] [image url] [thumbnail url]',
            permission: 'rr.edit',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            const message_id = interaction.options.getString('message_id'),
               index = interaction.options.getNumber('index'),
               json = interaction.options.getString('json'),
               content = interaction.options.getString('content');
            const data = await interaction.data.guildData.fetchData();
            if (!message_id && !index) {
               const embed = Embeds.ERROR_EMBED.toJSON();
               embed.description = `Please include a message_id or index!`;
               return await interaction.reply({ embeds: [embed] });
            }
            const rr = data.reaction_roles.find((val, valIndex) =>
               message_id ? val.message_id == message_id : index ? valIndex == index - 1 : undefined,
            );
            if (!rr) {
               const embed = Embeds.ERROR_EMBED.toJSON();
               embed.description = `Couldn't find that reaction role!`;
               return await interaction.reply({ embeds: [embed] });
            }
            const message_channel = rr.channel_id
               ? interaction.data.guild.channels.cache.get(rr.channel_id)
               : undefined;
            const message =
               message_channel && message_channel.isTextBased()
                  ? message_channel.messages.cache.get(rr.message_id)
                  : await getMessage(interaction.data.guild, rr.message_id);
            if (!message) {
               const embed = Embeds.ERROR_EMBED.toJSON();
               embed.description = `No message found! Might want to remove that reaction role.`;
               return await interaction.reply({ embeds: [embed] });
            }
            if (json) {
               const messageEdit = await message
                  .edit({
                     ...(content ? { content } : {}),
                     embeds: [
                        JSON.parse(
                           await parsePlaceholders(
                              json || '',
                              interaction.data.guild,
                              interaction.member as GuildMember | undefined,
                           ),
                        ) as APIEmbed,
                     ],
                  })
                  .catch(() => undefined);
               let embed = Embeds.SUCCESS_EMBED.toJSON();
               if (!messageEdit) {
                  embed = Embeds.ERROR_EMBED.toJSON();
                  embed.description = `There was an error sending that embed!`;
                  return await interaction.reply({ embeds: [embed] });
               }

               embed.title = '👈 Edited Reaction Role';
               embed.description = `Edited a reaction role${message ? ` in ${message.channel}` : ''}.`;
               await interaction.data.guildData.log(interaction.data.guild, {
                  user_id: interaction.data.member.id,
                  description: `Edited a reaction role.`,
                  type: LogType.REACTION_ROLE_EDITED,
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
                                 JSON.stringify(parameters),
                                 interaction.data.guild,
                                 interaction.member as GuildMember | undefined,
                              ),
                           ),
                        ) as APIEmbed,
                     ],
                  })
                  .catch(() => undefined);
               let embed = Embeds.SUCCESS_EMBED.toJSON();
               if (!messageEdit) {
                  embed = Embeds.ERROR_EMBED.toJSON();
                  embed.description = `There was an error sending that embed!`;
                  return await interaction.reply({ embeds: [embed] });
               }

               embed.title = '👈 Edited Reaction Role';
               embed.description = `Edited a reaction role${message ? ` in ${message.channel}` : ''}.`;
               await interaction.data.guildData.log(interaction.data.guild, {
                  user_id: interaction.data.member.id,
                  description: `Edited a reaction role.`,
                  type: LogType.REACTION_ROLE_EDITED,
                  date_unix: Date.now(),
               });
               return await interaction.reply({ embeds: [embed] });
            } catch (x) {
               const embed = Embeds.ERROR_EMBED.toJSON();
               embed.description = `There was an error creating that embed!`;
               return await interaction.reply({ embeds: [embed] });
            }
         },
      },
   ],
   async execute() {
      return;
   },
};
module.exports = reactionRolesCommand;
