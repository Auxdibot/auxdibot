import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const reactionRolesList = <AuxdibotSubcommand>{
   name: 'list',
   info: {
      module: Modules['Roles'],
      description: 'List the reaction roles on this server.',
      usageExample: '/reaction_roles list',
      permission: 'rr.list',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      const server = interaction.data.guildData;
      successEmbed.title = '👈 Reaction Roles';
      successEmbed.description = server.reaction_roles.reduce(
         (accumulator: string, value, index) =>
            `${accumulator}\r\n\r\n**${index + 1})** Message ID: *${value.messageID}* \r\n(${value.reactions.reduce(
               (acc: string, val2, index) => (index == 0 ? `${val2.emoji}` : `${acc}, ${val2.emoji}`),
               '',
            )})`,
         '',
      );
      return await interaction.reply({ embeds: [successEmbed] });
   },
};
