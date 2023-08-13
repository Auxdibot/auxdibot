import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleLog from '@/util/handleLog';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';
import { ChannelType } from 'discord.js';

export const starboardChannel = <AuxdibotSubcommand>{
   name: 'channel',
   info: {
      module: Modules['Starboard'],
      description: 'Set the channel where starred messages are sent.',
      usageExample: '/starboard channel (channel)',
      permission: 'starboard.settings.channel',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Starboard Channel Changed';

      const formerChannel = interaction.data.guild.channels.resolve(server.starboard_channel || '');
      if ((channel && channel.id == server.starboard_channel) || (!channel && !server.starboard_channel)) {
         embed.description = `Nothing changed. Starboard channel is the same as one specified in settings.`;
         return await interaction.reply({
            embeds: [embed],
         });
      }
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { starboard_channel: channel?.id || null },
      });
      embed.description = `The starboard channel for this server has been changed.\r\n\r\nFormerly: ${
         formerChannel ? `<#${formerChannel.id}>` : 'None'
      }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;

      await handleLog(
         auxdibot,
         interaction.data.guild,
         {
            type: LogAction.STARBOARD_CHANNEL_CHANGED,
            userID: interaction.data.member.id,
            date_unix: Date.now(),
            description: `The starboard channel for this server has been changed.`,
         },
         [
            {
               name: 'Starboard Channel Change',
               value: `Formerly: ${formerChannel || 'None'}\n\nNow: ${channel || 'None (Disabled)'}`,
               inline: false,
            },
         ],
      );
      return await interaction.reply({
         embeds: [embed],
      });
   },
};
