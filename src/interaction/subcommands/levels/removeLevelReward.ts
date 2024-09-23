import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import deleteLevelReward from '@/modules/features/levels/deleteLevelReward';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const removeLevelReward = <AuxdibotSubcommand>{
   name: 'remove',
   group: 'rewards',
   info: {
      module: Modules['Levels'],
      description: 'Remove a reward from the Level Rewards.',
      usageExample: '/levels reward remove [level|index]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const level = interaction.options.getInteger('level', false);
      const indexID = interaction.options.getInteger('index', false);
      const server = interaction.data.guildData;
      const reward = server.level_rewards.find((reward, index) => reward.level == level || index == indexID - 1);
      if (!reward) {
         return await handleError(auxdibot, 'REWARD_ROLE_NOT_FOUND', "This reward role doesn't exist!", interaction);
      }
      deleteLevelReward(auxdibot, interaction.guild, interaction.user, server.level_rewards.indexOf(reward))
         .then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Successfully removed <@&${reward.roleID}> (for \`Level ${reward.level}\`) from the role rewards!`;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'LEVEL_REWARD_REMOVE_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't remove that level reward.",
               interaction,
            );
         });
   },
};
