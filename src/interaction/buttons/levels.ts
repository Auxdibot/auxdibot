import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleError from '@/util/handleError';
import { createLevelsStatEmbed } from '@/modules/features/levels/createLevelsStatEmbed';

export default <AuxdibotButton>{
   module: Modules['Moderation'],
   name: 'levels',
   command: 'levels stats',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const user = await auxdibot.users.fetch(user_id).catch(() => undefined);
      const data = await auxdibot.database.servermembers.findFirst({
         where: { userID: user_id, serverID: interaction.guild.id },
      });
      if (!data)
         return await handleError(auxdibot, 'MEMBER_DATA_NOT_FOUND', 'Member data could not be found!', interaction);
      return await auxdibot.createReply(interaction, { embeds: [await createLevelsStatEmbed(auxdibot, data, user)] });
   },
};
