import { ChannelType, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { greetingsChannel } from '@/interaction/subcommands/greetings/greetingsChannel';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('greetings')
      .setDescription('Change settings for greetings on the server.')
      .addSubcommand((builder) =>
         builder
            .setName('channel')
            .setDescription('Set the greetings channel for this server, where join and leave messages are broadcast.')
            .addChannelOption((builder) =>
               builder
                  .setName('channel')
                  .setDescription('The channel to broadcast join and leave messages to.')
                  .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
            ),
      ),
   info: {
      module: Modules['Greetings'],
      description: 'Change settings for greetings on the server.',
      usageExample: '/greetings (channel)',
   },
   subcommands: [greetingsChannel],
   async execute() {
      return;
   },
};
