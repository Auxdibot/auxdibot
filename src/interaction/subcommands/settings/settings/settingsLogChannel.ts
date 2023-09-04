import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleLog from '@/util/handleLog';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';
import { ChannelType } from 'discord.js';

export const settingsLogChannel = <AuxdibotSubcommand>{
   name: 'log_channel',
   info: {
      module: Modules['Settings'],
      description: 'Change the log channel for the server, where all actions are logged to.',
      usageExample: '/settings log_channel (channel)',
      permission: 'settings.log_channel',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Log Channel Change';

      const formerChannel = interaction.data.guild.channels.resolve(server.log_channel || '');
      if (channel && channel.id == server.log_channel) {
         embed.description = `Nothing changed. Log channel is the same as one specified in settings.`;
         return await interaction.reply({
            embeds: [embed],
         });
      }
      server.log_channel = channel?.id;
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { log_channel: channel?.id || null },
      });
      embed.description = `The Log Channel for this server has been changed.\r\n\r\nFormerly: ${
         formerChannel ? `<#${formerChannel.id}>` : 'None'
      }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;
      await handleLog(auxdibot, interaction.data.guild, {
         type: LogAction.LOG_CHANNEL_CHANGED,
         userID: interaction.data.member.id,
         date_unix: Date.now(),
         description: `The Log Channel for this server has been changed to ${channel.name}`,
      });
      return await interaction.reply({
         embeds: [embed],
      });
   },
};
