import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import userRecordAsEmbed from '@/modules/features/moderation/userRecordAsEmbed';
import handleError from '@/util/handleError';

export const punishmentRecord = <AuxdibotSubcommand>{
   name: 'record',
   info: {
      module: Modules['Moderation'],
      description: "View a user's punishment record.",
      usageExample: '/punishment record (user)',
      permission: 'moderation.punishments.record',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const user = interaction.options.getUser('user') || interaction.user;
      const embed = await userRecordAsEmbed(auxdibot, interaction.data.guild.id, user.id);
      if (!embed)
         return await handleError(
            auxdibot,
            'FAILED_RECORD_EMBED',
            "Couldn't generate the record embed for that user!",
            interaction,
         );

      await interaction.reply({ embeds: [embed] });
   },
};
