import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setJoinLeaveChannel from '@/modules/features/greetings/setJoinLeaveChannel';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord.js';

export const greetingsChannel = <AuxdibotSubcommand>{
   name: 'channel',
   info: {
      module: Modules['Greetings'],
      description: 'Set the greetings channel for this server, where join and leave messages are broadcast.',
      usageExample: '/greetings channel [channel]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', false, [
         ChannelType.GuildText,
         ChannelType.GuildAnnouncement,
      ]);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Greetings Channel Change';
      const formerChannel = interaction.data.guild.channels.resolve(server.join_leave_channel || '');
      if (channel && channel.id == server.join_leave_channel) {
         embed.description = `Nothing changed. Channel is the same as one specified in settings.`;
         return await auxdibot.createReply(interaction, {
            embeds: [embed],
         });
      }
      server.join_leave_channel = channel?.id;
      embed.description = `The Greetings Channel for this server has been changed.\r\n\r\nFormerly: ${
         formerChannel ? `<#${formerChannel.id}>` : 'None'
      }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;
      // TODO: change all join/leave channel instances to greetings channel.. yeesh
      await setJoinLeaveChannel(auxdibot, interaction.guild, interaction.user, channel)
         .then(
            async () =>
               await auxdibot.createReply(interaction, {
                  embeds: [embed],
               }),
         )
         .catch(() =>
            handleError(
               auxdibot,
               'GREETINGS_CHANNEL_SET_ERROR',
               "Couldn't set the Greetings channel to that channel!",
               interaction,
            ),
         );
   },
};
