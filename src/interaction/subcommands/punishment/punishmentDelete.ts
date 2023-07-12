import Modules from '@/constants/bot/commands/Modules';
import { PunishmentNames } from '@/constants/bot/punishments/PunishmentNames';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import deletePunishment from '@/modules/features/moderation/deletePunishment';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';

export const punishmentDelete = <AuxdibotSubcommand>{
   name: 'delete',
   info: {
      module: Modules['Moderation'],
      description: 'Delete a punishment.',
      usageExample: '/punishment delete (punishment_id)',
      permission: 'moderation.punishments.delete',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const punishment_id = interaction.options.getNumber('punishment_id', true);
      const server = interaction.data.guildData;
      const punishment = server.punishments.filter((val) => val.punishmentID == punishment_id)[0];
      if (!punishment) {
         return await handleError(auxdibot, 'PUNISHMENT_NOT_FOUND', 'This punishment does not exist!', interaction);
      }

      deletePunishment(auxdibot, server.serverID, punishment_id);

      const type = PunishmentNames[punishment.type].name;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = `${type} deleted. (PID: ${punishment.punishmentID})`;
      embed.description = `${interaction.user} deleted a punishment assigned to <@${punishment.userID}>.`;
      embed.fields = [punishmentInfoField(punishment)];
      await handleLog(
         auxdibot,
         interaction.data.guild,
         {
            type: LogAction.PUNISHMENT_DELETED,
            date_unix: Date.now(),
            userID: interaction.user.id,
            description: `${interaction.user.username} deleted a punishment. (PID: ${punishment.punishmentID})`,
         },
         [punishmentInfoField(punishment)],
      );
      await interaction.reply({ embeds: [embed] });
   },
};
