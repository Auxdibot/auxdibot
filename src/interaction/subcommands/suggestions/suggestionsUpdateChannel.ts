import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleLog from '@/util/handleLog';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';
import { ChannelType } from 'discord.js';

export const suggestionsUpdateChannel = <AuxdibotSubcommand>{
   name: 'updates_channel',
   info: {
      module: Modules['Suggestions'],
      description: 'Change the channel where updates to suggestions are posted.',
      usageExample: '/suggestions updates_channel (channel)',
      permission: 'suggestions.channel.updates',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Suggestions Updates Channel Changed';

      const formerChannel = interaction.data.guild.channels.resolve(server.suggestions_updates_channel || '');
      if (channel && channel.id == server.suggestions_updates_channel) {
         embed.description = `Nothing changed. Suggestions updates channel is the same as one specified in settings.`;
         return await interaction.reply({
            embeds: [embed],
         });
      }
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { suggestions_updates_channel: channel?.id || null },
      });
      embed.description = `The suggestions updates channel for this server has been changed.\r\n\r\nFormerly: ${
         formerChannel ? `<#${formerChannel.id}>` : 'None'
      }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;
      await handleLog(
         auxdibot,
         interaction.data.guild,
         {
            type: LogAction.SUGGESTIONS_UPDATES_CHANNEL_CHANGED,
            userID: interaction.data.member.id,
            date_unix: Date.now(),
            description: 'The suggestions updates channel for this server has been changed.',
         },
         [
            {
               name: 'Suggestions Updates Channel Change',
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
