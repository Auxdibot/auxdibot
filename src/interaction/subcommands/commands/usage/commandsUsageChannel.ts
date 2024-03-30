import Modules from '@/constants/bot/commands/Modules';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import { ChannelType, EmbedBuilder } from 'discord.js';

export default <AuxdibotSubcommand>{
   name: 'channel',
   group: 'usage',
   info: {
      module: Modules['Settings'],
      description: 'Set the channel where Auxdibot commands can be executed.',
      usageExample: '/commands usage channel (command)',
   },
   async execute(auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.guild) return;
      const channel = interaction.options.getChannel('channel', false, [
         ChannelType.GuildText,
         ChannelType.GuildAnnouncement,
      ]);

      await auxdibot.database.servers
         .update({ where: { serverID: interaction.guildId }, data: { commands_channel: channel?.id ?? null } })
         .then(async (data) => {
            if (!data) {
               return handleError(
                  auxdibot,
                  'COMMANDS_CHANNEL_ERROR',
                  'There was an error updating the command channel.',
                  interaction,
               );
            }
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Command Permissions Updated';
            embed.description = channel
               ? `Auxdibot command usage has been restricted to the <#${channel.id}> channel.`
               : `Auxdibot commands are no longer restricted to a specific channel.`;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch(() => {
            handleError(
               auxdibot,
               'COMMANDS_CHANNEL_ERROR',
               'There was an error updating the command channel.',
               interaction,
            );
         });
   },
};
