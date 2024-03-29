import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const suggestionsReactions = <AuxdibotSubcommand>{
   name: 'reactions',
   info: {
      module: Modules['Suggestions'],
      description: 'List the reactions for suggestions.',
      usageExample: '/suggestions reactions',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const infoEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      const server = interaction.data.guildData;
      infoEmbed.title = '❓ Suggestions Reactions';
      infoEmbed.description = server.suggestions_reactions.reduce(
         (accumulator: string, value: string, index: number) => `${accumulator}\n**${index + 1})** ${value}`,
         '',
      );
      return await auxdibot.createReply(interaction, { embeds: [infoEmbed] });
   },
};
