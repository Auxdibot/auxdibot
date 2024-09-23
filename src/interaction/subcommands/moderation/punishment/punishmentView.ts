import Modules from '@/constants/bot/commands/Modules';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { punishmentInfoField } from '@/modules/features/moderation/punishmentInfoField';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const punishmentView = <AuxdibotSubcommand>{
   name: 'view',
   info: {
      module: Modules['Moderation'],
      description: 'View a punishment.',
      usageExample: '/punishment view (punishment_id)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const punishmentID = interaction.options.getNumber('punishment_id', true);
      const server = interaction.data.guildData;
      const punishment = server.punishments.filter((val) => val.punishmentID == punishmentID)[0];
      if (!punishment) {
         return await handleError(auxdibot, 'PUNISHMENT_NOT_FOUND', 'This punishment does not exist!', interaction);
      }
      const type = PunishmentValues[punishment.type].name;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      embed.title = `${type} Information (PID: ${punishment.punishmentID})`;
      embed.description = `This is the punishment information for <@${punishment.userID}>`;
      embed.fields = [punishmentInfoField(punishment, true, true)];
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
