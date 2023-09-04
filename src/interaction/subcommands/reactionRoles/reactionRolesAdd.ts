import Modules from '@/constants/bot/commands/Modules';
import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { testLimit } from '@/util/testLimit';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction, Reaction } from '@prisma/client';
import { ChannelType } from 'discord.js';
import emojiRegex from 'emoji-regex';

export const reactionRolesAdd = <AuxdibotSubcommand>{
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
      const regex = emojiRegex();
      const reactionsAndRoles: Reaction[] = await builder.reduce(
         async (accumulator: Promise<Reaction[]> | Reaction[], item: string[]) => {
            const arr: Reaction[] = await accumulator;
            if (!interaction.data) return arr;
            if (!item[0] || !item[1]) return arr;
            const role = await interaction.data.guild.roles.fetch((item[1].match(/\d+/) || [])[0] || '');
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
};
