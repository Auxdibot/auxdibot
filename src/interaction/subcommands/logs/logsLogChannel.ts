import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setLogChannel from '@/modules/features/logging/setLogChannel';
import { EmbedBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord.js';

export const logsLogChannel = <AuxdibotSubcommand>{
   name: 'channel',
   info: {
      module: Modules['Settings'],
      description: 'Change the log channel for the server, where all actions are logged to.',
      usageExample: '/logs channel (channel)',
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
         return await auxdibot.createReply(interaction, {
            embeds: [embed],
         });
      }
      server.log_channel = channel?.id;
      return setLogChannel(auxdibot, interaction.guild, interaction.user, channel).then(async () => {
         embed.description = `The Log Channel for this server has been changed.\r\n\r\nFormerly: ${
            formerChannel ? `<#${formerChannel.id}>` : 'None'
         }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;
         return await auxdibot.createReply(interaction, {
            embeds: [embed],
         });
      });
   },
};
