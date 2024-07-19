import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import deleteChannelMultiplier from '@/modules/features/levels/deleteChannelMultiplier';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord.js';

export const levelsRemoveChannelMultiplier = <AuxdibotSubcommand>{
   name: 'remove_channel',
   group: 'multipliers',
   info: {
      module: Modules['Levels'],
      description: 'Remove a reward from the Level Rewards.',
      usageExample: '/levels multipliers remove_channel (channel|index)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;

      const server = interaction.data.guildData,
         channel = interaction.options.getChannel('channel', false, [
            ChannelType.GuildAnnouncement,
            ChannelType.GuildText,
            ChannelType.GuildVoice,
            ChannelType.GuildStageVoice,
         ]),
         index = interaction.options.getInteger('index', false);
      if (!channel && !index) {
         return await handleError(
            auxdibot,
            'CHANNEL_INVALID',
            'You must provide a valid channel or index.',
            interaction,
         );
      }
      const multiplier = server.channel_multipliers.find((reward, i) => reward.id == channel?.id || i == index - 1);
      if (!multiplier) {
         return await handleError(
            auxdibot,
            'CHANNEL_MULTIPLIER_NOT_FOUND',
            'The channel multiplier specified does not exist!',
            interaction,
         );
      }
      deleteChannelMultiplier(
         auxdibot,
         interaction.guild,
         interaction.user,
         server.channel_multipliers.indexOf(multiplier),
      )
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Channel Multiplier Removed';
            embed.description = `Successfully removed the channel multiplier for <#${multiplier.id}>.`;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'CHANNEL_MULTIPLIER_REMOVE_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't remove that channel multiplier.",
               interaction,
            );
         });
   },
};
