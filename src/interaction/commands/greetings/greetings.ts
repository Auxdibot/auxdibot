import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { greetingsChannel } from '@/interaction/subcommands/greetings/greetingsChannel';
import { joinMessage } from '@/interaction/subcommands/greetings/join/joinMessage';
import { joinPreview } from '@/interaction/subcommands/greetings/join/joinPreview';
import { leaveMessage } from '@/interaction/subcommands/greetings/leave/leaveMessage';
import { leavePreview } from '@/interaction/subcommands/greetings/leave/leavePreview';
import { joinDMMessage } from '@/interaction/subcommands/greetings/join_dm/joinDMMessage';
import { joinDMPreview } from '@/interaction/subcommands/greetings/join_dm/joinDMPreview';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('greetings')
      .setDescription('Change settings for greetings on the server.')
      .addSubcommandGroup((builder) =>
         builder
            .setName('join')
            .setDescription('Change settings for join messages on the server.')
            .addSubcommand((builder) =>
               builder
                  .setName('message')
                  .setDescription('Set the join message for this server.')
                  .addStringOption((builder) =>
                     builder.setName('id').setDescription('The ID of the stored embed to use. (/embed storage list)'),
                  ),
            )
            .addSubcommand((builder) => builder.setName('preview').setDescription('Preview the join embed.')),
      )
      .addSubcommandGroup((builder) =>
         builder
            .setName('leave')
            .setDescription('Change settings for leave messages on the server.')
            .addSubcommand((builder) =>
               builder
                  .setName('message')
                  .setDescription('Set the leave message for this server.')
                  .addStringOption((builder) =>
                     builder
                        .setName('id')
                        .setDescription('The ID of the stored embed to use. (/embed storage list)')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) => builder.setName('preview').setDescription('Preview the leave embed.')),
      )
      .addSubcommandGroup((builder) =>
         builder
            .setName('join_dm')
            .setDescription('Change settings for join DMs on the server.')
            .addSubcommand((builder) =>
               builder
                  .setName('message')
                  .setDescription('Set the join DM message for this server.')
                  .addStringOption((builder) =>
                     builder
                        .setName('id')
                        .setDescription('The ID of the stored embed to use. (/embed storage list)')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) => builder.setName('preview').setDescription('Preview the join DM embed.')),
      )
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
      usageExample: '/greetings (channel|join|join_dm|leave)',
      permissionsRequired: [PermissionFlagsBits.ManageGuild],
   },
   subcommands: [greetingsChannel, joinMessage, joinPreview, leaveMessage, leavePreview, joinDMMessage, joinDMPreview],
   async execute() {
      return;
   },
};
