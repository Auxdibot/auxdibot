import { ModalSubmitInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import handleError from '@/util/handleError';
import { punishments, PunishmentType } from '@prisma/client';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import createPunishment from '@/modules/features/moderation/createPunishment';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import timestampToDuration from '@/util/timestampToDuration';
import { getServerPunishments } from '@/modules/features/moderation/getServerPunishments';

export default <AuxdibotModal>{
   module: Modules['Moderation'],
   name: 'mute',
   command: 'punish mute',
   async execute(auxdibot: Auxdibot, interaction: ModalSubmitInteraction) {
      const [, id] = interaction.customId.split('-');
      const member = await interaction.guild?.members.fetch(id);
      const previous = await getServerPunishments(auxdibot, interaction.guildId, {
         userID: member.id,
         type: PunishmentType.MUTE,
         expired: false,
      });
      if (!member) {
         return handleError(auxdibot, 'MEMBER_NOT_IN_SERVER', 'This user is not in the server!', interaction);
      }
      const server = await findOrCreateServer(auxdibot, interaction.guildId);
      if (previous.length > 0)
         return await handleError(auxdibot, 'USER_ALREADY_MUTED', 'This user is already muted!', interaction);
      await interaction.deferReply({ ephemeral: true });
      const reason = interaction.fields.getTextInputValue('reason') ?? 'No reason specified.';
      const durationOption = interaction.fields.getTextInputValue('duration') ?? 'permanent';
      const duration = timestampToDuration(durationOption);

      if (!duration) {
         return await handleError(
            auxdibot,
            'INVALID_TIMESTAMP',
            'The timestamp provided is invalid! (Examples of valid timestamps: "1m" for 1 minute, "5d" for 5 days.)',
            interaction,
         );
      }
      if (Number(duration) < 60000) {
         return handleError(
            auxdibot,
            'TOO_SHORT_DURATION',
            'You need to specify a duration longer than one minute!',
            interaction,
         );
      }
      if (!server.mute_role) {
         if (duration == 'permanent') {
            return await handleError(
               auxdibot,
               'NO_TIMEOUT_PERMANENT',
               'Cannot timeout a member permanently!',
               interaction,
            );
         }
      }
      const expires = duration == 'permanent' || !duration ? 'permanent' : duration + Date.now();
      const muteData = <punishments>{
         moderatorID: interaction.user.id,
         serverID: interaction.guildId,
         userID: id,
         reason,
         date: new Date(),
         dmed: false,
         expires_date: expires && typeof expires != 'string' ? new Date(expires) : undefined,
         expired: false,
         type: PunishmentType.MUTE,
         punishmentID: await incrementPunishmentsTotal(auxdibot, interaction.guild.id),
      };

      await createPunishment(auxdibot, interaction.guild, muteData, interaction, member.user, duration).catch(
         async (x) => {
            await handleError(
               auxdibot,
               'PUNISHMENT_CREATION_ERROR',
               x.message ?? 'An unknown error occurred while creating the punishment!',
               interaction,
            );
         },
      );
   },
};
