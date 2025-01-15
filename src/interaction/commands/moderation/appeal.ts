import Modules from '@/constants/bot/commands/Modules';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { createAppeal } from '@/modules/features/moderation/appeals/createAppeal';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';
import handleError from '@/util/handleError';
import { Guild, SlashCommandBuilder } from 'discord.js';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('appeal')
      .setDescription('Appeal a punishment that was given to you.')
      .addStringOption((option) =>
         option
            .setName('appeal_id')
            .setDescription('The appeal ID for the punishment you want to appeal.')
            .setRequired(true),
      )
      .addStringOption((option) =>
         option.setName('reason').setDescription('The reason for appealing this punishment.').setRequired(true),
      ),

   info: {
      description: 'Appeal a punishment that was given to you using Auxdibot.',
      module: Modules['Moderation'],
      allowedDefault: true,
      dmableCommand: true,
      usageExample: '/appeal (appeal_id) (reason)',
   },
   async execute(auxdibot, interaction) {
      await interaction.deferReply({ ephemeral: true });
      const [serverID, punishment_id] = interaction.options.getString('appeal_id').split('$');
      const reason = interaction.options.getString('reason');
      if (reason.length > 1000) {
         return handleError(
            auxdibot,
            'REASON_TOO_LONG',
            'The appeal reason you provided is too long! Please keep it under 1000 characters.',
            interaction,
         );
      }
      const punishment = await getServerPunishments(auxdibot, serverID, {
         punishmentID: Number(punishment_id),
         userID: interaction.user.id,
         expired: false,
      }).catch(() => []);
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
