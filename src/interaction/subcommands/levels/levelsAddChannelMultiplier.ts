import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import createChannelMultiplier from '@/modules/features/levels/createChannelMultiplier';

import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord.js';

export const levelsAddChannelMultiplier = <AuxdibotSubcommand>{
   name: 'add_channel',
   group: 'multipliers',
   info: {
      module: Modules['Levels'],
      description: 'Add a channel to the multiplier list.',
      usageExample: '/levels multipliers add_channel (channel) (multiplier)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [
         ChannelType.GuildAnnouncement,
         ChannelType.GuildText,
         ChannelType.GuildVoice,
         ChannelType.GuildStageVoice,
      ]);
      const multiplier = interaction.options.getNumber('multiplier', true);
      if (multiplier < 0 || multiplier > 999) {
         return await handleError(auxdibot, 'MULTIPLIER_INVALID', 'Multiplier must be between 0 and 999.', interaction);
      }
      createChannelMultiplier(auxdibot, interaction.guild, interaction.user, { id: channel.id, multiplier })
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Channel Multiplier Added';
            embed.description = `Successfully added <#${channel.id}> (with a multiplier of \`x${multiplier}\`) as a channel multiplier!`;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'CHANNEL_MULTIPLIER_ADD_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't add that channel multiplier.",
               interaction,
            );
         });
   },
};
