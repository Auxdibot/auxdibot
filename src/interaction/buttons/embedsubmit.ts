import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { APIEmbed, EmbedBuilder, MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleError from '@/util/handleError';
import { storeEmbed } from '@/modules/features/embeds/storeEmbed';

export default <AuxdibotButton>{
   module: Modules['Messages'],
   name: 'embedsubmit',
   command: 'embed build',
   async execute(auxdibot: Auxdibot, interaction: MessageComponentInteraction) {
      const [, id] = interaction.customId.split('-');
      const session = auxdibot.build_sessions.get(
         `${interaction.guildId}:${interaction.channelId}:${interaction.message.id}`,
      );
      if (!session) {
         return handleError(
            auxdibot,
            'SESSION_INACTIVE',
            'This session has gone inactive! Run the /embed build command to start a new session.\n\n*By default, sessions will go inactive after 5 minutes.*',
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
      if (!session.embed && !session.content) {
         return handleError(auxdibot, 'NO_CONTENT', 'You must provide content or an embed to store!', interaction);
      }
      await interaction.deferReply();
      return storeEmbed(auxdibot, interaction.guild, id, session.embed as APIEmbed, session.content).then(() => {
         auxdibot.build_sessions.delete(`${interaction.guildId}:${interaction.channelId}:${interaction.message.id}`);
         const cancel = new EmbedBuilder()
            .setColor(auxdibot.colors.accept)
            .setTitle('Embed Stored')
            .setDescription('This session is now inactive.');
         interaction.message
            .edit({
               content: '',
               embeds: [cancel],
               components: [],
            })
            .catch(() => undefined);
         return auxdibot.createReply(interaction, {
            content: `# Stored Embed\nID: \`${id}\`\n\n${session.content ?? ''}`,
            embeds: session?.embed ? [session?.embed as APIEmbed] : undefined,
            ephemeral: true,
         });
      });
   },
};
