import { ChannelType, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { starboardChannel } from '../../subcommands/starboard/starboardChannel';
import { starboardReaction } from '../../subcommands/starboard/starboardReaction';
import { starboardReactionCount } from '../../subcommands/starboard/starboardReactionCount';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('starboard')
      .setDescription('Change the starboard settings for this server.')
      .addSubcommand((builder) =>
         builder
            .setName('channel')
            .setDescription('Set the channel where starred messages are sent.')
            .addChannelOption((builder) =>
               builder
                  .setName('channel')
                  .setDescription('The channel to send starred messages to.')
                  .addChannelTypes(ChannelType.GuildText),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('reaction')
            .setDescription('Set the starboard reaction for this server.')
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
            .setDescription('Set the starboard reaction count for this server.')
            .addNumberOption((builder) =>
               builder
                  .setName('reaction_count')
                  .setDescription('The reaction count for a message to reach before being posted to the starboard.')
                  .setRequired(true),
            ),
      ),
   info: {
      module: Modules['Starboard'],
      description: 'Change the starboard settings for this server.',
      usageExample: '/starboard (stats|channel|reaction|reaction_count)',
      permission: 'starboard',
   },
   subcommands: [starboardChannel, starboardReaction, starboardReactionCount],
   async execute() {
      return;
   },
};
