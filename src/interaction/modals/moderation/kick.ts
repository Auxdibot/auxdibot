import { ModalSubmitInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import handleError from '@/util/handleError';
import { punishments, PunishmentType } from '@prisma/client';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import createPunishment from '@/modules/features/moderation/createPunishment';

export default <AuxdibotModal>{
   module: Modules['Moderation'],
   name: 'kick',
   command: 'punish kick',
   async execute(auxdibot: Auxdibot, interaction: ModalSubmitInteraction) {
      const [, id] = interaction.customId.split('-');
      const member = await interaction.guild?.members.fetch(id);
      if (!member) {
         return handleError(auxdibot, 'MEMBER_NOT_IN_SERVER', 'This user is not in the server!', interaction);
      }
      await interaction.deferReply({ ephemeral: true });
      const reason = interaction.fields.getTextInputValue('reason') ?? 'No reason specified.';
      const kickData = <punishments>{
         moderatorID: interaction.user.id,
         userID: id,
         reason,
         date: new Date(),
         dmed: false,
         expires_date: undefined,
         expired: true,
         serverID: interaction.guildId,
         type: PunishmentType.KICK,
         punishmentID: await incrementPunishmentsTotal(auxdibot, interaction.guild.id),
      };

      await createPunishment(auxdibot, interaction.guild, kickData, interaction, member.user).catch(async (x) => {
         await handleError(
            auxdibot,
            'PUNISHMENT_CREATION_ERROR',
            x.message ?? 'An unknown error occurred while creating the punishment!',
            interaction,
         );
      });
   },
};
