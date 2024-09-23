import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import purgeMessages from '@/modules/features/moderation/purgeMessages';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { EmbedBuilder, PermissionsBitField } from 'discord.js';

export const purgeInvites = <AuxdibotSubcommand>{
   name: 'invites',
   info: {
      module: Modules['Moderation'],
      description: 'Purge messages based on whether they have attachments.',
      usageExample: '/purge invites (amount)',
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
      return await purgeMessages(interaction.channel, amount, undefined, undefined, false, true)
         .then(async (i) => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.default).toJSON();
            embed.title = `💥 Message Purge Results (Invites Purge)`;
            if (i.totalDeleted == 0) {
               embed.description = `No messages were purged.`;
               return await interaction.channel.send({ embeds: [embed] });
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
                  date: new Date(),
               },
               [
                  {
                     name: '💥 Message Purge Results (Invites Purge)',
                     value: `🗑️ Messages Purged: ${i.totalDeleted}\n🚫 Failed Deletions: ${i.failedDeletions}`,
                     inline: false,
                  },
               ],
            );
            return await interaction.channel.send({ embeds: [embed] });
         })
         .catch(async (x) => {
            console.log(x);
            return await handleError(
               auxdibot,
               'PURGE_ERROR',
               'An error occurred attempting to purge messages in this channel!',
               interaction,
            );
         });
   },
};
