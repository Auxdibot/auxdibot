import { ChannelType, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { starboardBoardCreate } from '@/interaction/subcommands/starboard/board/starboardBoardCreate';
import { starboardBoardDelete } from '@/interaction/subcommands/starboard/board/starboardBoardDelete';
import { starboardChannel } from '@/interaction/subcommands/starboard/board/starboardChannel';
import { starboardReaction } from '@/interaction/subcommands/starboard/board/starboardReaction';
import { starboardReactionCount } from '@/interaction/subcommands/starboard/board/starboardReactionCount';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('starboard')
      .setDescription('Change the starboard settings for this server.')
      .addSubcommandGroup((builder) =>
         builder
            .setName('board')
            .setDescription('Change the starboard settings for this server.')
            .addSubcommand((builder) =>
               builder
                  .setName('create')
                  .setDescription('Create a starboard for this server.')
                  .addStringOption((builder) =>
                     builder
                        .setName('name')
                        .setDescription('The unique name of the starboard for this server.')
                        .setRequired(true),
                  )
                  .addChannelOption((builder) =>
                     builder
                        .setName('channel')
                        .setDescription('The channel to send starred messages to.')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
                  )
                  .addStringOption((builder) =>
                     builder.setName('reaction').setDescription("The reaction to use for this server's starboard."),
                  )
                  .addNumberOption((builder) =>
                     builder
                        .setName('reaction_count')
                        .setDescription(
                           'The reaction count for a message to reach before being posted to the starboard.',
                        ),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('delete')
                  .setDescription('Delete the starboard for this server.')
                  .addStringOption((builder) =>
                     builder
                        .setName('name')
                        .setDescription('The unique name of the starboard for this server.')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('channel')
                  .setDescription('Set the channel for a starboard.')
                  .addStringOption((builder) =>
                     builder
                        .setName('name')
                        .setDescription('The unique name of the starboard for this server.')
                        .setRequired(true),
                  )
                  .addChannelOption((builder) =>
                     builder
                        .setName('channel')
                        .setDescription('The channel to send starred messages to.')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('reaction')
                  .setDescription('Set the reaction for a starboard.')
                  .addStringOption((builder) =>
                     builder
                        .setName('name')
                        .setDescription('The unique name of the starboard for this server.')
                        .setRequired(true),
                  )
                  .addStringOption((builder) =>
                     builder
                        .setName('reaction')
                        .setDescription("The reaction to use for this server's starboard.")
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('reaction_count')
                  .setDescription('Set the reaction count for a starboard.')
                  .addStringOption((builder) =>
                     builder
                        .setName('name')
                        .setDescription('The unique name of the starboard for this server.')
                        .setRequired(true),
                  )
                  .addNumberOption((builder) =>
                     builder
                        .setName('reaction_count')
                        .setDescription(
                           'The reaction count for a message to reach before being posted to the starboard.',
                        )
                        .setRequired(true),
                  ),
            ),
      )
      .addSubcommandGroup((builder) =>
         builder
            .setName('settings')
            .setDescription('View the starboard settings for this server.')
            .addSubcommand((builder) =>
               builder.setName('self_star').setDescription('Toggle whether or not users can star their own messages.'),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('starboard_star')
                  .setDescription('Toggle whether or not users can star messages in the starboard.'),
            ),
      )
      .addSubcommandGroup((builder) =>
         builder
            .setName('view')
            .setDescription('View the starboard settings for this server.')
            .addSubcommand((builder) =>
               builder.setName('starboards').setDescription('View the starboards for this server.'),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('starboard')
                  .setDescription('View the settings for a starboard on this server.')
                  .addStringOption((builder) =>
                     builder
                        .setName('name')
                        .setDescription('The unique name of the starboard for this server.')
                        .setRequired(true),
                  ),
            ),
      ),

   info: {
      module: Modules['Starboard'],
      description: 'Change the starboard settings for this server.',
      usageExample: '/starboard (board|settings|view)',
   },
   subcommands: [
      starboardBoardCreate,
      starboardBoardDelete,
      starboardChannel,
      starboardReaction,
      starboardReactionCount,
   ],
   async execute() {
      return;
   },
};
