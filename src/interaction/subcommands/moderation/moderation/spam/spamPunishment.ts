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

export const spamPunishment = <AuxdibotSubcommand>{
   name: 'punishment',
   group: 'spam',
   info: {
      module: Modules['Moderation'],
      description: 'Set the punishment for spam on this server.',
      usageExample: '/moderation spam punishment (punishment) [reason]',
      permission: 'moderation.spam.punishment',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const punishment = interaction.options.getString('punishment', true),
         reason = interaction.options.getString('reason');
      const server = interaction.data.guildData;
      if (
         server.automod_spam_punishment?.punishment == punishment &&
         server.automod_spam_punishment?.reason == reason
      ) {
         return await handleError(
            auxdibot,
            'PUNISHMENT_IDENTICAL',
            'That is the same punishment as the current automod spam limit punishment!',
            interaction,
         );
      }
      if (!PunishmentType[punishment]) {
         return await handleError(
            auxdibot,
            'INVALID_PUNISHMENT',
            'This is an invalid spam limit punishment type!',
            interaction,
         );
      }
      if (reason.length > 500) {
         return await handleError(
            auxdibot,
            'REASON_TOO_LONG',
            'The reason specified is too long! (Max characters: 500)',
            interaction,
         );
      }
      return auxdibot.database.servers
         .update({
            where: { serverID: server.serverID },
            data: {
               automod_spam_punishment: {
                  punishment: PunishmentType[punishment],
                  reason:
                     reason ??
                     server.automod_spam_punishment.reason ??
                     'You have broken the spam limit for this server.',
               },
            },
         })
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Successfully set \`${PunishmentValues[punishment].name}\` as the server spam limit punishment.`;
            await handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `The Automod spam punishment has been set to ${punishment}`,
               type: LogAction.AUTOMOD_SETTINGS_CHANGE,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [embed] });
         })
         .catch(() => {
            handleError(
               auxdibot,
               'ERROR_SPAM_LIMIT_PUNISHMENT',
               "Couldn't set that as the spam limit punishment!",
               interaction,
            );
         });
   },
};
