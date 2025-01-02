import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';
import { CustomEmojis } from '@/constants/bot/CustomEmojis';
import { LogAction } from '@prisma/client';
export const premiumAdd = <AuxdibotSubcommand>{
   name: 'add',
   info: {
      name: 'add',
      module: Modules['Settings'],
      description: 'Add your premium subscription to this server.',
      usageExample: '/premium add',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      try {
         const user = await auxdibot.database.users.upsert({
               where: { userID: interaction.user.id },
               update: {},
               create: { userID: interaction.user.id },
            }),
            premium = await auxdibot.fetchPremiumSubscriptionUser(interaction.guild.id);
         if (premium) {
            return handleError(auxdibot, 'PREMIUM_ALREADY', 'This server is already a premium server!', interaction);
         }
         if (user.premium_servers.length >= 3) {
            return handleError(
               auxdibot,
               'TOO_MANY_SERVERS',
               "You have too many premium servers added! Remove a server's premium status and try again.",
               interaction,
            );
         }
         if (user.premium_servers.find((server) => server == interaction.guild.id)) {
            return handleError(auxdibot, 'ALREADY_PREMIUM', 'This server is already a premium server!', interaction);
         }
         user.premium_servers.push(interaction.guild.id);
         await auxdibot.database.users
            .update({
               where: { userID: interaction.user.id },
               data: { premium_servers: user.premium_servers },
            })
            .then(() => {
               auxdibot.log(interaction.guild, {
                  type: LogAction.PREMIUM_ADDED,
                  date: new Date(),
                  description: `${interaction.user.username} added this server to their premium subscription.`,
                  userID: interaction.user.id,
               });
            });
         const embed = new EmbedBuilder()
            .setColor(auxdibot.colors.premium)
            .setTitle(`${CustomEmojis.PREMIUM} Premium Added`)
            .setDescription(`This server has been successfully added to your premium subscription!`)
            .setFields([
               {
                  name: 'What now?',
                  value: 'You have unlocked\n* Unlimited storage for your server.\n* Access to premium commands.\n* A badge on the Auxdibot card for this server.',
               },
            ])
            .setFooter({
               text: 'Thank you for supporting the future of Auxdibot.',
            });

         return await auxdibot.createReply(interaction, {
            embeds: [embed.toJSON()],
         });
      } catch (x) {
         console.error(x);
         return handleError(
            auxdibot,
            'PREMIUM_ADD_ERROR',
            'An error occurred while adding this server to your premium subscription.',
            interaction,
         );
      }
   },
};
