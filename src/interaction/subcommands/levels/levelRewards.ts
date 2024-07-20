import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';
import _ from 'lodash';

export const levelRewards = <AuxdibotSubcommand>{
   name: 'list',
   group: 'rewards',
   info: {
      module: Modules['Levels'],
      description: 'View the Level Rewards for this server.',
      usageExample: '/levels rewards list',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      const server = interaction.data.guildData;
      successEmbed.title = '🏆 Level Rewards';
      successEmbed.description =
         _.chain(server.level_rewards.map((i, index) => ({ ...i, index })))
            .groupBy('level')
            .map((i) => {
               return `**Rewards for \`Level ${i[0].level}\`**:\n${i
                  .map((x) => `* \`#${x.index + 1}\` - <@&${x.roleID}>`)
                  .join('\n')}`;
            })
            .value()
            .reduce((accumulator: string, val) => `${accumulator}\r\n\n${val}`, '') || 'No Level Rewards';
      return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
   },
};
