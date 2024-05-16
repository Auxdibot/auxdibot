import Modules from '@/constants/bot/commands/Modules';
import { defaultStarLevels } from '@/constants/database/defaultStarLevels';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import createStarboard from '@/modules/features/starboard/boards/createStarboard';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
import { StarboardBoardData } from '@prisma/client';
import { ChannelType } from 'discord.js';

export const starboardBoardCreate = <AuxdibotSubcommand>{
   name: 'create',
   group: 'board',
   info: {
      module: Modules['Starboard'],
      description: 'Create a new starboard for this server.',
      usageExample: '/starboard board create (name) (channel) [reaction] [reaction_count]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [
            ChannelType.GuildText,
            ChannelType.GuildAnnouncement,
         ]),
         boardName = interaction.options.getString('name', true),
         reaction = interaction.options.getString('reaction', false) ?? '⭐',
         reactionCount = interaction.options.getNumber('reaction_count', false) ?? 5;

      const starboard = <StarboardBoardData>{
         board_name: boardName,
         channelID: channel?.id,
         reaction: reaction,
         count: reactionCount,
         star_levels: defaultStarLevels,
      };

      createStarboard(auxdibot, interaction.guild, interaction.user, starboard)
         .then((data) => {
            if (!data) {
               return handleError(
                  auxdibot,
                  'STARBOARD_BOARD_CREATE_ERROR',
                  "Couldn't create the starboard board!",
                  interaction,
               );
            }
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = '💫 Starboard Created';
            embed.description = `The starboard board **${boardName}** hdas been created in <#${channel?.id}>, using the reaction ${reaction} and ${reactionCount} stars.`;
            auxdibot.createReply(interaction, { embeds: [embed] });
         })
         .catch((x) => {
            handleError(auxdibot, 'STARBOARD_BOARD_CREATE_ERROR', x, interaction);
         });
   },
};
