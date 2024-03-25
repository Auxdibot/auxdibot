import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const levelRewards = <AuxdibotSubcommand>{
   name: 'rewards',
   info: {
      module: Modules['Levels'],
      description: 'View the Level Rewards for this server.',
      usageExample: '/levels rewards',
      permission: 'levels.rewards',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      const server = interaction.data.guildData;
      successEmbed.title = '🏆 Level Rewards';
      successEmbed.description = server.level_rewards.reduce(
         (accumulator, value, index) =>
            `${accumulator}\n**${index + 1})** <@&${value.roleID}> (\`Level ${value.level}\`)`,
         '',
      );
      return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
   },
};
