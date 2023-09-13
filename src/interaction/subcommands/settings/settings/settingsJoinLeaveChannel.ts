import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setJoinLeaveChannel from '@/modules/features/greetings/setJoinLeaveChannel';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
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
      embed.description = `The Join/Leave Channel for this server has been changed.\r\n\r\nFormerly: ${
         formerChannel ? `<#${formerChannel.id}>` : 'None'
      }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;
      await setJoinLeaveChannel(auxdibot, interaction.guild, interaction.user, channel)
         .then(
            async () =>
               await interaction.reply({
                  embeds: [embed],
               }),
         )
         .catch(() =>
            handleError(
               auxdibot,
               'JOIN_LEAVE_CHANNEL_SET_ERROR',
               "Couldn't set the Join/Leave channel to that channel!",
               interaction,
            ),
         );
   },
};
