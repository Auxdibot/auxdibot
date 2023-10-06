import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import createEmbedParameters from '@/util/createEmbedParameters';
import Modules from '@/constants/bot/commands/Modules';
import { joinDMEmbedJSON } from '../../subcommands/settings/join_dm/joinDMEmbedJSON';
import { joinDMPreview } from '../../subcommands/settings/join_dm/joinDMPreview';
import { joinDMMessage } from '@/interaction/subcommands/settings/join_dm/joinDMMessage';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('join_dm')
      .setDescription('Change settings for join DM messages on the server.')
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
      module: Modules['Greetings'],
      description:
         'Change settings for join DM messages on the server. (Placeholders are supported. Do /help placeholders for a list of placeholders.)',
      usageExample: '/join_dm (message|embed_json|preview)',
      permission: 'settings.joindm',
   },
   subcommands: [joinDMMessage, joinDMEmbedJSON, joinDMPreview],
   async execute() {
      return;
   },
};
