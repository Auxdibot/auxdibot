import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { acceptModal } from '@/modules/features/moderation/appeals/modals';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';
import handleError from '@/util/handleError';
import { PermissionFlagsBits } from 'discord.js';

export const acceptAppeal = <AuxdibotSubcommand>{
   name: 'accept',
   info: {
      module: Modules['Moderation'],
      description: 'Accept an appeal.',
      allowedDefault: false,
      dmableCommand: false,
      usageExample: '/appeals accept (punishment_id)',
      premium: 'guild',
      permissionsRequired: [PermissionFlagsBits.ModerateMembers],
   },
   async execute(auxdibot, interaction) {
      const punishment_id = interaction.options.getInteger('punishment_id');
      const punishment = await getServerPunishments(auxdibot, interaction.guildId, {
         punishmentID: punishment_id,
         expired: false,
      });
      if (!punishment || punishment.length == 0) {
         return await handleError(auxdibot, 'PUNISHMENT_NOT_FOUND', 'I could not find that punishment!', interaction);
      }
      const [punishmentData] = punishment;
      if (punishmentData.appeal.accepted !== null) {
         return await handleError(
            auxdibot,
            'ALREADY_APPEALED',
            'This punishment has already been appealed/denied!',
            interaction,
         );
      }
      const modal = acceptModal(Number(punishment_id));
      return interaction.showModal(modal);
   },
};
