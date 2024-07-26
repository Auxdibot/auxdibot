import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import changeLeaderboardVisibility from '@/modules/features/levels/changeLeaderboardVisibility';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const levelsLeaderboardVisibility = <AuxdibotSubcommand>{
   name: 'leaderboard_visibility',
   group: 'settings',
   info: {
      module: Modules['Levels'],
      description: 'Toggle whether the leaderboard can be viewed online.',
      usageExample: '/levels settings leaderboard_visibility',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const visibility = interaction.options.getBoolean('visibility', true);
      return changeLeaderboardVisibility(auxdibot, interaction.guild, visibility)
         .then(async (data) => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).setTitle('Success!').toJSON();
            embed.description = data.publicize_leaderboard
               ? "The leaderboard will now be publicly accessible on Auxdibot's website."
               : "The leaderboard will no longer be publicly accessible on Auxdibot's website.";
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) =>
            handleError(
               auxdibot,
               'LEADERBOARD_VISIBILITY_SET_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't set the leaderboard visibility right now!",
               interaction,
            ),
         );
   },
};
