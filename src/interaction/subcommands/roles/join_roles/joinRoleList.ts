import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const joinRoleList = <AuxdibotSubcommand>{
   name: 'list',
   info: {
      module: Modules['Roles'],
      description: 'List the roles that are assigned when a member joins the server.',
      usageExample: '/join_roles list',
      permission: 'roles.join_roles.list',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      const server = interaction.data.guildData;
      successEmbed.title = '👋 Join Roles';
      successEmbed.description = server.join_roles.reduce(
         (accumulator: string, value: string, index: number) => `${accumulator}\n**${index + 1})** <@&${value}>`,
         '',
      );
      return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
   },
};
