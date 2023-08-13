import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleLog from '@/util/handleLog';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';
import { ChannelType } from 'discord.js';

export const levelsChannel = <AuxdibotSubcommand>{
   name: 'channel',
   info: {
      module: Modules['Levels'],
      description: 'Levelup messages channel, or leave empty for Auxdibot to reply to the current message.',
      usageExample: '/levels channel',
      permission: 'levels.channel',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Level Channel Changed';

      const formerChannel = interaction.data.guild.channels.resolve(server.level_channel || '');
      if ((channel && channel.id == server.level_channel) || (!channel && !server.level_channel)) {
         embed.description = `Nothing changed. Level channel is the same as one specified in settings.`;
         return await interaction.reply({
            embeds: [embed],
         });
      }
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { level_channel: channel?.id || null },
      });
      embed.description = `The level channel for this server has been changed.\r\n\r\nFormerly: ${
         formerChannel ? `<#${formerChannel.id}>` : 'None'
      }\r\n\r\nNow: ${channel || 'None (Reply)'}`;

      await handleLog(
         auxdibot,
         interaction.data.guild,
         {
            type: LogAction.LEVEL_CHANNEL_CHANGED,
            userID: interaction.data.member.id,
            date_unix: Date.now(),
            description: 'The level channel for this server has been changed.',
         },
         [
            {
               name: 'Level Channel Change',
               value: `Formerly: ${formerChannel || 'None'}\n\nNow: ${channel || 'None (Reply)'}`,
               inline: false,
            },
         ],
      );
      return await interaction.reply({
         embeds: [embed],
      });
   },
};
