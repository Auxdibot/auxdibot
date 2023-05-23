import { ChannelType, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@util/types/templates/AuxdibotCommand';
import AuxdibotCommandInteraction from '@util/types/templates/AuxdibotCommandInteraction';
import { GuildAuxdibotCommandData } from '@util/types/AuxdibotCommandData';
import Modules from '@util/constants/Modules';

const settingsCommand = <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('starboard')
      .setDescription('View the starboard stats or change the starboard settings for this server.')
      .addSubcommand((builder) =>
         builder.setName('stats').setDescription("View the stats for this server's starboard."),
      )
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
               builder.setName('reaction').setDescription("The reaction to use for this server's starboard."),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('reaction_count')
            .setDescription('Set the starboard reaction count for this server.')
            .addNumberOption((builder) =>
               builder
                  .setName('reaction_count')
                  .setDescription('The reaction count for a message to reach before being posted to the starboard.'),
            ),
      ),
   info: {
      module: Modules['Starboard'],
      description: 'View the starboard stats or change the starboard settings for this server.',
      usageExample: '/starboard (stats|channel|reaction|reaction_count)',
      permission: 'starboard',
   },
   subcommands: [
      {
         name: 'stats',
         info: {
            module: Modules['Starboard'],
            description: "View the stats for this server's starboard.",
            usageExample: '/starboard stats',
            permission: 'starboard.stats',
            allowedDefault: true,
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            return;
         },
      },
      {
         name: 'reaction',
         info: {
            module: Modules['Starboard'],
            description: 'Set the starboard reaction for this server.',
            usageExample: '/starboard reaction (reaction)',
            permission: 'starboard.settings.reaction',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            return;
         },
      },
      {
         name: 'reaction_count',
         info: {
            module: Modules['Starboard'],
            description: 'Set the starboard reaction count for this server.',
            usageExample: '/starboard reaction_count (reaction_count)',
            permission: 'starboard.settings.reaction_count',
         },
         async execute(interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
            if (!interaction.data) return;
            return;
         },
      },
   ],
   async execute() {
      return;
   },
};
module.exports = settingsCommand;
