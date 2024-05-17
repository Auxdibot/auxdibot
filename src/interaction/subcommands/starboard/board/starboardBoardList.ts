import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const starboardBoardList = <AuxdibotSubcommand>{
   name: 'list',
   group: 'board',
   info: {
      module: Modules['Starboard'],
      description: 'List all starboards for this server.',
      usageExample: '/starboard board list',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const starboards = interaction.data.guildData.starboard_boards;

      const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      embed.title = '🌟 Starboards';
      embed.description = 'Here are all the starboards for this server:';
      embed.fields = starboards.map((board) => {
         return {
            name: `🌟 Starboard: \`${board.board_name}\``,
            value: `Channel: <#${board.channelID}>\nReaction: ${board.reaction}\nReaction Count: \`${board.count}\``,
         };
      });
      return await auxdibot.createReply(interaction, { embeds: [embed] });
   },
};
