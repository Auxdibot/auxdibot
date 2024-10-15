import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { EmbedBuilder, MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import handleError from '@/util/handleError';

export default <AuxdibotButton>{
   module: Modules['Messages'],
   name: 'embedclose',
   command: 'embed builder',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      const session = auxdibot.build_sessions.get(
         `${interaction.guildId}:${interaction.channelId}:${interaction.message.id}`,
      );
      if (!session) {
         return handleError(
            auxdibot,
            'SESSION_INACTIVE',
            'This session has gone inactive! Run the /embed builder command to start a new session.\n\n*By default, sessions will go inactive after 5 minutes.*',
            interaction,
         );
      }
      if (session.userID !== interaction.user.id) {
         return handleError(
            auxdibot,
            'SESSION_USER_MISMATCH',
            'This session was started by another user!',
            interaction,
         );
      }
      auxdibot.build_sessions.delete(`${interaction.guildId}:${interaction.channelId}:${interaction.message.id}`);
      const cancel = new EmbedBuilder()
         .setColor(auxdibot.colors.denied)
         .setTitle('Embed Builder Closed')
         .setDescription('This session is now inactive.');
      interaction.message
         .edit({
            content: '',
            embeds: [cancel],
            components: [],
         })
         .catch(() => undefined);
      return interaction
         .deferReply()
         .then(() => interaction.deleteReply())
         .catch(() => undefined);
   },
};
