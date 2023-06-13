import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import createEmbedParameters from '@/util/createEmbedParameters';
import Modules from '@/constants/bot/commands/Modules';
import { joinMessage } from '../../subcommands/settings/join/joinMessage';
import { joinPreview } from '../../subcommands/settings/join/joinPreview';
import { joinEmbedJSON } from '../../subcommands/settings/join/joinEmbedJSON';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('join')
      .setDescription('Change settings for join messages on the server.')
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
      .addSubcommand((builder) => builder.setName('preview').setDescription('Preview the join embed.')),
   info: {
      module: Modules['Settings'],
      description:
         'Change settings for join messages on the server. (Placeholders are supported. Do /help placeholders for a list of placeholders.)',
      usageExample: '/join (message|embed_json|preview)',
      permission: 'settings.join',
   },
   subcommands: [joinMessage, joinEmbedJSON, joinPreview],
   async execute() {
      return;
   },
};
