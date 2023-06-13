import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const removeLevelReward = <AuxdibotSubcommand>{
   name: 'remove_reward',
   info: {
      module: Modules['Levels'],
      description: 'Remove a reward from the Level Rewards.',
      usageExample: '/levels remove_reward (level)',
      permission: 'levels.rewards.remove',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const level = interaction.options.getNumber('level', true);
      const server = interaction.data.guildData;
      const reward = server.level_rewards.find((reward) => reward.level == level);
      if (!reward) {
         return await handleError(auxdibot, 'REWARD_ROLE_NOT_FOUND', "This reward role doesn't exist!", interaction);
      }
      server.level_rewards.splice(server.level_rewards.indexOf(reward), 1);
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { level_rewards: server.level_rewards },
      });
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.description = `Successfully removed <@&${reward.roleID}> from the role rewards!`;
      return await interaction.reply({ embeds: [embed] });
   },
};
