import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';
import { CustomEmojis } from '@/constants/bot/CustomEmojis';
import { LogAction } from '@prisma/client';
export const premiumRemove = <AuxdibotSubcommand>{
   name: 'remove',
   info: {
      name: 'remove',
      module: Modules['Settings'],
      description: 'Remove your premium subscription from this server.',
      usageExample: '/premium remove',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      try {
         const user = await auxdibot.database.users.findFirst({ where: { userID: interaction.user.id } }),
            premium = await auxdibot.fetchPremiumSubscriptionUser(interaction.guild.id);
         if (!premium) {
            return handleError(auxdibot, 'PREMIUM_ALREADY', 'This server is not a premium server!', interaction);
         }
         if (!user.premium_servers.find((server) => server == interaction.guild.id)) {
            return handleError(
               auxdibot,
               'NOT_PREMIUM_PROVIDER',
               'You are not the provider of Auxdibot Premium for this server!',
               interaction,
            );
         }
         user.premium_servers.splice(user.premium_servers.indexOf(interaction.guild.id), 1);
         await auxdibot.database.users
            .update({
               where: { userID: interaction.user.id },
               data: { premium_servers: user.premium_servers },
            })
            .then(() => {
               auxdibot.log(interaction.guild, {
                  type: LogAction.PREMIUM_REMOVED,
                  date: new Date(),
                  description: `${interaction.user.username} removed this server from their premium subscription.`,
                  userID: interaction.user.id,
               });
            });
         const embed = new EmbedBuilder()
            .setColor(auxdibot.colors.default)
            .setTitle(`${CustomEmojis.AUXDIBOT} Premium Removed`)
            .setDescription(`This server has been successfully been removed from your premium subscription!`)
            .setFields([
               {
                  name: 'What now?',
                  value: 'This server has lost access to premium features and limits have been re-imposed.',
               },
            ])
            .setFooter({
               text: 'Thank you for supporting the future of Auxdibot.',
            });

         return await auxdibot.createReply(interaction, {
            embeds: [embed.toJSON()],
         });
      } catch (x) {
         return handleError(
            auxdibot,
            'PREMIUM_REMOVE_ERROR',
            'An error occurred while removing this server from your premium subscription.',
            interaction,
         );
      }
   },
};
