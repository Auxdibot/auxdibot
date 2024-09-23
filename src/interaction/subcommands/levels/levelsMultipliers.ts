import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const levelMultipliers = <AuxdibotSubcommand>{
   name: 'list',
   group: 'multipliers',
   info: {
      module: Modules['Levels'],
      description: 'List all multipliers on your server.',
      usageExample: '/levels multipliers list',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      const server = interaction.data.guildData;
      successEmbed.title = '✨ Level Multipliers';
      successEmbed.description = `**Global Multiplier:** \`x${server.global_multiplier}\``;
      successEmbed.fields = [
         {
            name: 'Channel Multipliers',
            value: server.channel_multipliers
               .map((i, index) => `**#${index + 1}**) <#${i.id}> - \`x${i.multiplier}\``)
               .join('\n'),
            inline: true,
         },
         {
            name: 'Role Multipliers',
            value: server.role_multipliers
               .map((i, index) => `**#${index + 1}**) <@&${i.id}>: \`x${i.multiplier}\``)
               .join('\n'),
            inline: true,
         },
      ];
      return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
   },
};
