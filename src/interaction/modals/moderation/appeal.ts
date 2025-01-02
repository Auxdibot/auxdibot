import { ModalSubmitInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import handleError from '@/util/handleError';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';
import { EmbedBuilder } from '@discordjs/builders';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { LogAction } from '@prisma/client';

export default <AuxdibotModal>{
   module: Modules['Moderation'],
   name: 'appeal',
   command: 'punishment delete',
   async execute(auxdibot: Auxdibot, interaction: ModalSubmitInteraction) {
      const [, punishment_id] = interaction.customId.split('-');
      await interaction.deferReply({ ephemeral: true });
      const punishment = await getServerPunishments(auxdibot, interaction.guildId, {
         punishmentID: Number(punishment_id),
         expired: false,
      });
      const server = await findOrCreateServer(auxdibot, interaction.guildId);
      if (!punishment || punishment.length == 0) {
         interaction.message.delete().catch(() => undefined);
         return await handleError(auxdibot, 'PUNISHMENT_NOT_FOUND', 'I could not find that punishment!', interaction);
      }
      const [punishmentData] = punishment;
      if (punishmentData.appeal && punishmentData.appeal.accepted !== null) {
         interaction.message.delete().catch(() => undefined);
         return await handleError(
            auxdibot,
            'ALREADY_APPEALED',
            'This punishment has already been appealed!',
            interaction,
         );
      }
      const reason = interaction.fields.getTextInputValue('reason');
      try {
         await auxdibot.database.punishments.update({
            where: { id: punishmentData.id },
            data: {
               appeal: {
                  ...punishmentData.appeal,
                  appeal_reason: reason,
                  accepted: true,
                  accepted_date: new Date(),
                  moderatorID: interaction.user.id,
               },
            },
         });
         const user = await auxdibot.users.fetch(punishmentData.userID).catch(() => undefined);
         if (user) {
            const appealed = new EmbedBuilder()
               .setTitle('✅ Punishment Appeal Accepted')
               .setColor(auxdibot.colors.accept)
               .setDescription(
                  `Your appeal for punishment #${punishmentData.punishmentID} has been accepted!${
                     server.punishment_send_moderator ? `\n\n🧍 Moderator: ${interaction.user}` : ''
                  }`,
               )
               .setFields(
                  punishmentInfoField(punishmentData, server.punishment_send_moderator, server.punishment_send_reason),
                  {
                     name: 'Appeal Reason',
                     value: reason,
                  },
               );
            await user.send({ embeds: [appealed] }).catch(() => undefined);
         }
         await interaction.message.delete().catch(() => undefined);
         auxdibot.log(
            interaction.guild,
            {
               date: new Date(),
               type: LogAction.APPEAL_ACCEPTED,
               description: `Punishment #${punishmentData.punishmentID} has been appealed by ${interaction.user.username} (${interaction.user.id})`,
               userID: interaction.user.id,
            },
            { fields: [punishmentInfoField(punishmentData, true, true)], user_avatar: true },
         );
         const embed = new EmbedBuilder()
            .setTitle('✅ Appeal Accepted')
            .setColor(auxdibot.colors.accept)
            .setDescription(`The appeal for punishment #${punishmentData.punishmentID} has been accepted!`)
            .addFields({
               name: 'Appeal Reason',
               value: reason,
            });

         return await auxdibot.createReply(interaction, { embeds: [embed] });
      } catch (x) {
         return handleError(auxdibot, 'PUNISHMENT_APPEAL_FAILED', 'Failed to appeal the punishment!', interaction);
      }
   },
};
