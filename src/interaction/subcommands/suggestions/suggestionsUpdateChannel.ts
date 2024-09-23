import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setSuggestionsUpdatesChannel from '@/modules/features/suggestions/setSuggestionsUpdatesChannel';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord.js';

export const suggestionsUpdateChannel = <AuxdibotSubcommand>{
   name: 'updates_channel',
   info: {
      module: Modules['Suggestions'],
      description: 'Change the channel where updates to suggestions are posted.',
      usageExample: '/suggestions updates_channel [channel]',
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
         return await auxdibot.createReply(interaction, {
            embeds: [embed],
         });
      }
      setSuggestionsUpdatesChannel(auxdibot, interaction.guild, interaction.user, channel)
         .then(async () => {
            embed.description = `The suggestions updates channel for this server has been changed.\r\n\r\nFormerly: ${
               formerChannel ? `<#${formerChannel.id}>` : 'None'
            }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;
            return await auxdibot.createReply(interaction, {
               embeds: [embed],
            });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'SUGGESTIONS_UPDATES_CHANNEL_SET_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't set the suggestions channel!",
               interaction,
            );
         });
   },
};
