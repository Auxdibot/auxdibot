import AuxdibotButton from '@/interfaces/buttons/AuxdibotButton';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageComponentInteraction } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import handleError from '@/util/handleError';
import { generateLevelCard } from '@/modules/features/levels/generateLevelCard';
import { CustomEmojis } from '@/constants/bot/CustomEmojis';

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
      const leaderboard =
         (await auxdibot.database.servermembers
            .count({
               where: { serverID: interaction.guild.id, xp: { gt: data.xp } },
            })
            .catch(() => 0)) + 1;
      const image = await generateLevelCard(user, data.xp, leaderboard);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
         new ButtonBuilder()
            .setURL(`${process.env.SITE_URL}/leaderboard/${interaction.guild.id}`)
            .setEmoji(CustomEmojis.LEVELS)
            .setLabel('Leaderboard')
            .setStyle(ButtonStyle.Link),
         new ButtonBuilder()
            .setCustomId('levelembed-' + user.id)
            .setLabel('View Legacy Embed')
            .setStyle(ButtonStyle.Secondary),
      );
      return await auxdibot.createReply(interaction, {
         files: [{ attachment: image, name: 'level.png' }],
         components: [row],
      });
   },
};
