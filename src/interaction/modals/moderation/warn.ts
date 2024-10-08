import { ModalSubmitInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import handleError from '@/util/handleError';
import { Punishment, PunishmentType } from '@prisma/client';
import incrementPunishmentsTotal from '@/modules/features/moderation/incrementPunishmentsTotal';
import createPunishment from '@/modules/features/moderation/createPunishment';

export default <AuxdibotModal>{
   module: Modules['Moderation'],
   name: 'warn',
   command: 'punish warn',
   async execute(auxdibot: Auxdibot, interaction: ModalSubmitInteraction) {
      const [, id] = interaction.customId.split('-');
      const member = await interaction.guild?.members.fetch(id);
      if (!member) {
         return handleError(auxdibot, 'MEMBER_NOT_IN_SERVER', 'This user is not in the server!', interaction);
      }
      await interaction.deferReply({ ephemeral: true });
      const reason = interaction.fields.getTextInputValue('reason');
      const warnData = <Punishment>{
         moderatorID: interaction.user.id,
         userID: id,
         reason,
         date: new Date(),
         dmed: false,
         expires_date: undefined,
         expired: true,
         type: PunishmentType.WARN,
         punishmentID: await incrementPunishmentsTotal(auxdibot, interaction.guild.id),
      };

      await createPunishment(auxdibot, interaction.guild, warnData, interaction, member.user).catch(async (x) => {
         await handleError(
            auxdibot,
            'PUNISHMENT_CREATION_ERROR',
            x.message ?? 'An unknown error occurred while creating the punishment!',
            interaction,
         );
      });
   },
};
