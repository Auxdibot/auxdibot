import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleLog from '@/util/handleLog';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';
import { ChannelType } from 'discord.js';

export const settingsJoinLeaveChannel = <AuxdibotSubcommand>{
   name: 'join_leave_channel',
   info: {
      module: Modules['Settings'],
      description: 'Change the channel where join and leave messages are broadcast.',
      usageExample: '/settings join_leave_channel (channel)',
      permission: 'settings.join_leave_channel',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Join/Leave Channel Change';
      const formerChannel = interaction.data.guild.channels.resolve(server.join_leave_channel || '');
      if (channel && channel.id == server.join_leave_channel) {
         embed.description = `Nothing changed. Channel is the same as one specified in settings.`;
         return await interaction.reply({
            embeds: [embed],
         });
      }
      server.join_leave_channel = channel?.id;
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { join_leave_channel: channel?.id || null },
      });
      embed.description = `The Join/Leave Channel for this server has been changed.\r\n\r\nFormerly: ${
         formerChannel ? `<#${formerChannel.id}>` : 'None'
      }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;
      await handleLog(
         auxdibot,
         interaction.data.guild,
         {
            type: LogAction.JOIN_LEAVE_CHANNEL_CHANGED,
            userID: interaction.data.member.id,
            date_unix: Date.now(),
            description: 'The Join/Leave Channel for this server has been changed.',
         },
         [
            {
               name: 'Join/Leave Channel Change',
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
