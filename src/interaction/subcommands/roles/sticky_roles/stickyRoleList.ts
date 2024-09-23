import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const stickyRoleList = <AuxdibotSubcommand>{
   name: 'list',
   info: {
      module: Modules['Roles'],
      description: 'List the roles that are kept when a member rejoins the server.',
      usageExample: '/sticky_roles list',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      successEmbed.title = '📝 Sticky Roles';
      successEmbed.description = server.sticky_roles.reduce(
         (accumulator: string, value: string, index: number) => `${accumulator}\n**${index + 1})** <@&${value}>`,
         '',
      );
      return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
   },
};
