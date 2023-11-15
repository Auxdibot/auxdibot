import Modules from '@/constants/bot/commands/Modules';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import deletePunishment from '@/modules/features/moderation/deletePunishment';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

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

      deletePunishment(auxdibot, interaction.guild, punishment_id, interaction.user);

      const type = PunishmentValues[punishment.type].name;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = `${type} deleted. (PID: ${punishment.punishmentID})`;
      embed.description = `${interaction.user} deleted a punishment assigned to <@${punishment.userID}>.`;
      embed.fields = [punishmentInfoField(punishment, true, true)];
      await interaction.reply({ embeds: [embed] });
   },
};
