import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord.js';
import setAppealsChannel from '@/modules/features/moderation/appeals/setAppealsChannel';

export const moderationAppealsChannel = <AuxdibotSubcommand>{
   name: 'channel',
   group: 'appeals',
   info: {
      module: Modules['Moderation'],
      description: 'Change the appeals channel for this server.',
      usageExample: '/moderation appeals channel [channel]',
      premium: 'guild',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', false, [ChannelType.GuildText]);
      const server = interaction.data.guildData;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Appeals Channel Change';

      const formerChannel = interaction.data.guild.channels.resolve(server.appeal_channel || '');
      if (channel && channel.id == server.appeal_channel) {
         embed.description = `Nothing changed. Appeals channel is the same as one specified in settings.`;
         return await auxdibot.createReply(interaction, {
            embeds: [embed],
         });
      }

      return setAppealsChannel(auxdibot, interaction.guild, interaction.user, channel).then(async () => {
         embed.description = `The Appeals Channel for this server has been changed.\r\n\r\nFormerly: ${
            formerChannel ? `<#${formerChannel.id}>` : 'None'
         }\r\n\r\nNow: ${channel || 'None (Disabled)'}`;
         return await auxdibot.createReply(interaction, {
            embeds: [embed],
         });
      });
   },
};
