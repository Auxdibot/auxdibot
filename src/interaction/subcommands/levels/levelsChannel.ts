import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setLevelChannel from '@/modules/features/levels/setLevelChannel';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord.js';

export const levelsChannel = <AuxdibotSubcommand>{
   name: 'channel',
   group: 'settings',
   info: {
      module: Modules['Levels'],
      description: 'Levelup messages channel, or leave empty for Auxdibot to reply to the current message.',
      usageExample: '/levels settings channel [channel]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Level Channel Changed';

      const formerChannel = interaction.data.guild.channels.resolve(server.level_channel || '');
      if ((channel && channel.id == server.level_channel) || (!channel && !server.level_channel)) {
         embed.description = `Nothing changed. Level channel is the same as one specified in settings.`;
         return await auxdibot.createReply(interaction, {
            embeds: [embed],
         });
      }
      setLevelChannel(auxdibot, interaction.guild, interaction.user, channel)
         .then(async () => {
            embed.description = `The level channel for this server has been changed.\r\n\r\nFormerly: ${
               formerChannel ? `<#${formerChannel.id}>` : 'None'
            }\r\n\r\nNow: ${channel || 'None (Reply)'}`;
            return await auxdibot.createReply(interaction, {
               embeds: [embed],
            });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'LEVELS_CHANNEL_SET_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't set the level channel.",
               interaction,
            );
         });
   },
};
