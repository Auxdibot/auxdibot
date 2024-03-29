import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const exceptionsList = <AuxdibotSubcommand>{
   name: 'list',
   group: 'exceptions',
   info: {
      module: Modules['Moderation'],
      description: 'List the roles that are excempt from AutoMod punishments and limits.',
      usageExample: '/moderation exceptions list',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      const server = interaction.data.guildData;
      successEmbed.title = '🛡️ AutoMod Exceptions';
      successEmbed.description = server.automod_role_exceptions.reduce(
         (accumulator: string, value: string, index: number) => `${accumulator}\n**${index + 1})** <@&${value}>`,
         '',
      );
      return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
   },
};
