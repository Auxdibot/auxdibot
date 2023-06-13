import Modules from '@/constants/bot/commands/Modules';
import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import parsePlaceholders from '@/util/parsePlaceholder';
import { testLimit } from '@/util/testLimit';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction, Reaction } from '@prisma/client';
import { ChannelType } from 'discord.js';
import emojiRegex from 'emoji-regex';

export const reactionRolesAddJSON = <AuxdibotSubcommand>{
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
                  await parsePlaceholders(auxdibot, json || '', interaction.data.guild, interaction.data.member),
               ),
            ],
         })
         .catch(() => undefined);
      if (!message) {
         return await handleError(auxdibot, 'EMBED_SEND_ERROR', 'There was an error sending that embed!', interaction);
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
};
