import Modules from '@/constants/bot/commands/Modules';
import { CustomEmojis } from '@/constants/bot/CustomEmojis';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { generateLevelCard } from '@/modules/features/levels/generateLevelCard';
import handleError from '@/util/handleError';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const levelsStats = <AuxdibotSubcommand>{
   name: 'level',
   group: 'stats',
   info: {
      module: Modules['Levels'],
      description: "View a user's level stats. Leave empty to view your own.",
      usageExample: '/levels stats level [user]',
      allowedDefault: true,
      permissionsRequired: [],
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      await interaction.deferReply();
      const user = interaction.options.getUser('user') ?? interaction.user;
      const data = await auxdibot.database.servermembers.findFirst({
         where: { userID: user.id, serverID: interaction.data.guild.id },
      });
      if (!data)
         return await handleError(auxdibot, 'MEMBER_DATA_NOT_FOUND', 'Member data could not be found!', interaction);
      const leaderboard =
         (await auxdibot.database.servermembers
            .count({
               where: { serverID: interaction.data.guild.id, xp: { gt: data.xp } },
            })
            .catch(() => 0)) + 1;
      const image = await generateLevelCard(user, data.xp, leaderboard);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
         new ButtonBuilder()
            .setURL(`${process.env.BOT_HOMEPAGE}/leaderboard/${interaction.data.guild.id}`)
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
