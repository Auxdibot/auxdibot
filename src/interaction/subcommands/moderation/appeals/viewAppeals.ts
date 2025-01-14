import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { generateAppealsList } from '@/modules/features/moderation/appeals/generateAppealsList';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';
import handleError from '@/util/handleError';

import { PermissionFlagsBits } from 'discord.js';

export const viewAppeals = <AuxdibotSubcommand>{
   name: 'view',
   info: {
      module: Modules['Moderation'],
      description: 'View all appeals that are currently pending on the server.',
      allowedDefault: false,
      dmableCommand: false,
      usageExample: '/appeals view',
      premium: 'guild',
      permissionsRequired: [PermissionFlagsBits.ModerateMembers],
   },
   async execute(auxdibot, interaction) {
      await interaction.deferReply();
      const appeals = await getServerPunishments(
         auxdibot,
         interaction.guildId,
         {
            expired: false,
            appeal: { isNot: null },
         },
         10,
         {
            appeal: { accepted: 'asc', date_appealed: 'desc' },
         },
      );
      const { punishments } = await auxdibot.database.totals
         .findFirst({ where: { serverID: interaction.guildId }, select: { punishments: true } })
         .catch(() => ({ punishments: 0 }));

      if (appeals.length == 0) {
         return handleError(auxdibot, 'NO_APPEALS_ERROR', 'There are no appeals to view.', interaction);
      }
      const embed = generateAppealsList(auxdibot, appeals, punishments);
      return auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
