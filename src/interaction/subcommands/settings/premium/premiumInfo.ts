import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';
import { CustomEmojis } from '@/constants/bot/CustomEmojis';
export const premiumInfo = <AuxdibotSubcommand>{
   name: 'info',
   info: {
      name: 'info',
      module: Modules['Settings'],
      description: 'Get information about the premium subscription attached to this server.',
      usageExample: '/premium info',
      premium: null,
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      try {
         const premium = await auxdibot.fetchPremiumSubscriptionUser(interaction.guild.id);
         if (!premium) {
            return handleError(auxdibot, 'PREMIUM_ALREADY', 'This server is not a premium server!', interaction);
         }

         const embed = new EmbedBuilder()
            .setColor(auxdibot.colors.premium)
            .setTitle(`${CustomEmojis.PREMIUM} Premium Server`)
            .setDescription(`Provider: <@${premium}>`)
            .setThumbnail(interaction.guild.iconURL());

         return await auxdibot.createReply(interaction, {
            embeds: [embed.toJSON()],
         });
      } catch (x) {
         return handleError(
            auxdibot,
            'PREMIUM_INFO_ERROR',
            'An error occurred while fetching the premium information for this server.',
            interaction,
         );
      }
   },
};
