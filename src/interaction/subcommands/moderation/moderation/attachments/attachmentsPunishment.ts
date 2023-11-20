import { Auxdibot } from '../../../../../interfaces/Auxdibot';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import handleError from '@/util/handleError';
import { EmbedBuilder } from 'discord.js';
import { LogAction, PunishmentType } from '@prisma/client';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';
import handleLog from '@/util/handleLog';

export const attachmentsPunishment = <AuxdibotSubcommand>{
   name: 'punishment',
   group: 'attachments',
   info: {
      module: Modules['Moderation'],
      description: 'Set the punishment for attachments spam on this server.',
      usageExample: '/moderation attachments punishment (punishment) [reason]',
      permission: 'moderation.attachments.punishment',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const punishment = interaction.options.getString('punishment', true),
         reason = interaction.options.getString('reason');
      const server = interaction.data.guildData;
      if (
         server.automod_attachments_punishment?.punishment == punishment &&
         server.automod_attachments_punishment?.reason == reason
      ) {
         return await handleError(
            auxdibot,
            'PUNISHMENT_IDENTICAL',
            'That is the same punishment as the current automod attachments spam limit punishment!',
            interaction,
         );
      }
      if (!PunishmentType[punishment]) {
         return await handleError(
            auxdibot,
            'INVALID_PUNISHMENT',
            'This is an invalid attachments spam punishment type!',
            interaction,
         );
      }
      return auxdibot.database.servers
         .update({
            where: { serverID: server.serverID },
            data: {
               automod_attachments_punishment: {
                  punishment: PunishmentType[punishment],
                  reason: reason || server.automod_attachments_punishment.reason,
               },
            },
         })
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Successfully set \`${PunishmentValues[punishment].name}\` as the server attachments spam punishment.`;
            await handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `The Automod attachments spam punishment has been set to ${punishment}`,
               type: LogAction.AUTOMOD_SETTINGS_CHANGE,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [embed] });
         })
         .catch(() => {
            handleError(
               auxdibot,
               'ERROR_ATTACHMENTS_LIMIT_PUNISHMENT',
               "Couldn't set that as the attachments limit punishment!",
               interaction,
            );
         });
   },
};
