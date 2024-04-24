import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setReportsChannel from '@/modules/features/moderation/reports/setReportsChannel';
import { EmbedBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord.js';

export const reportsChannel = <AuxdibotSubcommand>{
   name: 'channel',
   group: 'reports',
   info: {
      module: Modules['Moderation'],
      description: 'Change the reports channel for this server.',
      usageExample: '/moderation reports channel [channel]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Reports Channel Change';

      const formerChannel = interaction.data.guild.channels.resolve(server.reports_channel || '');
      if (channel && channel.id == server.reports_channel) {
         embed.description = `Nothing changed. Reports channel is the same as one specified in settings.`;
         return await auxdibot.createReply(interaction, {
            embeds: [embed],
         });
      }
      server.reports_channel = channel?.id;
      return setReportsChannel(auxdibot, interaction.guild, interaction.user, channel).then(async () => {
         embed.description = `The Reports Channel for this server has been changed.\r\n\r\nFormerly: ${
            formerChannel ? `<#${formerChannel.id}>` : 'None'
         }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;
         return await auxdibot.createReply(interaction, {
            embeds: [embed],
         });
      });
   },
};
