import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleLog from '@/util/handleLog';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';
import { ChannelType } from 'discord.js';

export const suggestionsChannel = <AuxdibotSubcommand>{
   name: 'channel',
   info: {
      module: Modules['Suggestions'],
      description: 'Change the channel where suggestions are posted. (None to disable.)',
      usageExample: '/suggestions channel [channel]',
      permission: 'suggestions.channel',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Suggestions Channel Changed';

      const formerChannel = interaction.data.guild.channels.resolve(server.suggestions_channel || '');
      if ((channel && channel.id == server.suggestions_channel) || (!channel && !server.suggestions_channel)) {
         embed.description = `Nothing changed. Suggestions channel is the same as one specified in settings.`;
         return await interaction.reply({
            embeds: [embed],
         });
      }
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { suggestions_channel: channel.id },
      });
      embed.description = `The suggestions channel for this server has been changed.\r\n\r\nFormerly: ${
         formerChannel ? `<#${formerChannel.id}>` : 'None'
      }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;

      await handleLog(
         auxdibot,
         interaction.data.guild,
         {
            type: LogAction.SUGGESTIONS_CHANNEL_CHANGED,
            userID: interaction.data.member.id,
            date_unix: Date.now(),
            description: 'The suggestions channel for this server has been changed.',
         },
         [
            {
               name: 'Suggestions Channel Change',
               value: `Formerly: ${formerChannel}\n\nNow: ${channel}`,
               inline: false,
            },
         ],
      );
      return await interaction.reply({
         embeds: [embed],
      });
   },
};
