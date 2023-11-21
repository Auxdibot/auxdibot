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

export const invitesPunishment = <AuxdibotSubcommand>{
   name: 'punishment',
   group: 'invites',
   info: {
      module: Modules['Moderation'],
      description: 'Set the punishment for invites spam on this server.',
      usageExample: '/moderation invites punishment (punishment) [reason]',
      permission: 'moderation.invites.punishment',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const punishment = interaction.options.getString('punishment', true),
         reason = interaction.options.getString('reason');
      const server = interaction.data.guildData;
      if (
         server.automod_invites_punishment?.punishment == punishment &&
         server.automod_invites_punishment?.reason == reason
      ) {
         return await handleError(
            auxdibot,
            'PUNISHMENT_IDENTICAL',
            'That is the same punishment as the current automod invites spam limit punishment!',
            interaction,
         );
      }
      if (!PunishmentType[punishment]) {
         return await handleError(
            auxdibot,
            'INVALID_PUNISHMENT',
            'This is an invalid invites spam punishment type!',
            interaction,
         );
      }
      return auxdibot.database.servers
         .update({
            where: { serverID: server.serverID },
            data: {
               automod_invites_punishment: {
                  punishment: PunishmentType[punishment],
                  reason: reason || server.automod_invites_punishment.reason,
               },
            },
         })
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Successfully set \`${PunishmentValues[punishment].name}\` as the server invites spam punishment.`;
            await handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `The Automod invites spam punishment has been set to ${punishment}`,
               type: LogAction.AUTOMOD_SETTINGS_CHANGE,
               date_unix: Date.now(),
            });
            return await interaction.reply({ embeds: [embed] });
         })
         .catch(() => {
            handleError(
               auxdibot,
               'ERROR_INVITES_LIMIT_PUNISHMENT',
               "Couldn't set that as the invites limit punishment!",
               interaction,
            );
         });
   },
};
