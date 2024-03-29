import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import createEmbedParameters from '@/util/createEmbedParameters';
import Modules from '@/constants/bot/commands/Modules';
import { leaveMessage } from '../../subcommands/greetings/leave/leaveMessage';
import { leaveEmbedJSON } from '../../subcommands/greetings/leave/leaveEmbedJSON';
import { leavePreview } from '../../subcommands/greetings/leave/leavePreview';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('leave')
      .setDescription('Change settings for leave messages on the server.')
      .addSubcommand((builder) =>
         createEmbedParameters(builder.setName('message').setDescription('Display an embed (With placeholders)!')),
      )
      .addSubcommand((builder) =>
         builder
            .setName('embed_json')
            .setDescription('Display some JSON as an embed (With placeholders)!')
            .addStringOption((option) =>
               option
                  .setName('json')
                  .setDescription('The JSON data to use for creating the Discord Embed.')
                  .setRequired(true),
            ),
      )
      .addSubcommand((builder) => builder.setName('preview').setDescription('Preview the leave embed.')),
   info: {
      module: Modules['Greetings'],
      description:
         'Change settings for leave messages on the server. (Placeholders are supported. Do /help placeholders for a list of placeholders.)',
      usageExample: '/leave (message|embed_json|preview)',
   },
   subcommands: [leaveMessage, leaveEmbedJSON, leavePreview],
   async execute() {
      return;
   },
};
