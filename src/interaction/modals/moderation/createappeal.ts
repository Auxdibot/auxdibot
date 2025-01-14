import Modules from '@/constants/bot/commands/Modules';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import { createAppeal } from '@/modules/features/moderation/appeals/createAppeal';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';
import handleError from '@/util/handleError';
import { Guild } from 'discord.js';

export default <AuxdibotModal>{
   name: 'createappeal',
   module: Modules['Moderation'],
   command: 'appeal',
   allowedDefault: true,
   async execute(auxdibot, interaction) {
      const [, appeal_id] = interaction.customId.split('-');
      const [serverID, punishmentID] = appeal_id.split('$');

      const reason = interaction.fields.getTextInputValue('reason');
      const punishment = await getServerPunishments(auxdibot, serverID, {
         punishmentID: Number(punishmentID),
         userID: interaction.user.id,
         expired: false,
      });
      if (punishment.length == 0) {
         return handleError(auxdibot, 'PUNISHMENT_NOT_FOUND', 'I could not find that punishment!', interaction);
      }
      const [punishmentData] = punishment;
      if (punishmentData.appeal) {
         return handleError(auxdibot, 'ALREADY_APPEALED', 'This punishment has already been appealed!', interaction);
      }

      const guild: Guild | undefined = await auxdibot.guilds.fetch(serverID).catch(() => undefined);

      if (!guild) {
         return handleError(auxdibot, 'GUILD_NOT_FOUND', 'I could not find that server!', interaction);
      }
      return createAppeal(auxdibot, guild, punishmentData, reason, interaction);
   },
};
