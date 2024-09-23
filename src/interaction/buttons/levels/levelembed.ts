import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import handleError from '@/util/handleError';
import { createLevelsStatEmbed } from '@/modules/features/levels/createLevelsStatEmbed';

export default <AuxdibotButton>{
   module: Modules['Levels'],
   name: 'levelembed',
   command: 'mylevel',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      if (!interaction.guild || !interaction.user || !interaction.channel) return;
      const [, user_id] = interaction.customId.split('-');
      const user = user_id ? await auxdibot.users.fetch(user_id).catch(() => undefined) : interaction.user;
      const member = await auxdibot.database.servermembers.findFirst({
         where: { serverID: interaction.guild.id, userID: user.id },
      });
      if (!user || !member) {
         return await handleError(auxdibot, 'FAILED_LEVEL_EMBED', 'No member data found!', interaction);
      }
      const embed = await createLevelsStatEmbed(auxdibot, member, user).catch((x) => {
         console.error(x);
      });
      if (!embed)
         return await handleError(
            auxdibot,
            'FAILED_LEVEL_EMBED',
            "Couldn't generate the level embed for that user!",
            interaction,
         );
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
