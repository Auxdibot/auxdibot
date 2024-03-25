import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import purgeMessages from '@/modules/features/moderation/purgeMessages';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { EmbedBuilder, PermissionsBitField } from 'discord.js';

export const purgeAll = <AuxdibotSubcommand>{
   name: 'all',
   info: {
      module: Modules['Moderation'],
      description: 'Purge messages regardless of content or user.',
      usageExample: '/purge all (amount)',
      permission: 'moderation.purge.all',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const amount = interaction.options.getNumber('amount', true);
      if (
         !interaction.channel.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.ManageMessages)
      ) {
         return await handleError(
            auxdibot,
            'BOT_MISSING_PERMISSION',
            'Auxdibot needs the `Manage Messages` permission in order to do this!',
            interaction,
         );
      }
      if (amount > 150) {
         return await handleError(
            auxdibot,
            'TOO_MANY_MESSAGES',
            'You cannot purge more than 150 messages in one command!',
            interaction,
         );
      }
      await auxdibot.createReply(interaction, { ephemeral: true, content: 'Currently purging messages...' });
      return await purgeMessages(interaction.channel, amount)
         .then(async (i) => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.default).toJSON();
            embed.title = `💥 Message Purge Results (All Purge)`;
            if (i.totalDeleted == 0) {
               embed.description = `No messages were purged.`;
               return await auxdibot.createReply(interaction, { embeds: [embed] });
            }
            embed.color = auxdibot.colors.punishment;
            embed.description = `🗑️ Messages Purged: ${i.totalDeleted}\n🚫 Failed Deletions: ${i.failedDeletions}`;
            await handleLog(
               auxdibot,
               interaction.guild,
               {
                  type: LogAction.MESSAGES_PURGED,
                  userID: interaction.user.id,
                  description: `${interaction.user.username} purged ${i.totalDeleted} messages in #${interaction.channel.name}.`,
                  date_unix: Date.now(),
               },
               [
                  {
                     name: '💥 Message Purge Results (All Purge)',
                     value: `🗑️ Messages Purged: ${i.totalDeleted}\n🚫 Failed Deletions: ${i.failedDeletions}`,
                     inline: false,
                  },
               ],
            );
            return await interaction.channel.send({ embeds: [embed] });
         })
         .catch(async () => {
            return await handleError(
               auxdibot,
               'PURGE_ERROR',
               'An error occurred attempting to purge messages in this channel!',
               interaction,
            );
         });
   },
};
