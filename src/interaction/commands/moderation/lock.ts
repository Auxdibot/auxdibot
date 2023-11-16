import { ChannelType, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { lockChannel } from '@/interaction/subcommands/moderation/lock/lockChannel';
import { lockServer } from '@/interaction/subcommands/moderation/lock/lockServer';
export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('lock')
      .setDescription('Command for unlocking and locking channel and server.')
      .addSubcommand((builder) =>
         builder
            .setName('channel')
            .setDescription('Lock a channel. Run /unlock channel to unlock it again.')
            .addChannelOption((builder) =>
               builder
                  .setName('channel')
                  .setDescription('The channel to lock.')
                  .addChannelTypes(
                     ChannelType.GuildText,
                     ChannelType.GuildAnnouncement,
                     ChannelType.GuildForum,
                     ChannelType.GuildVoice,
                     ChannelType.PublicThread,
                     ChannelType.PrivateThread,
                     ChannelType.AnnouncementThread,
                  ),
            )
            .addStringOption((builder) => builder.setName('reason').setDescription('The reason for the lock.'))
            .addStringOption((builder) =>
               builder
                  .setName('duration')
                  .setDescription('The duration for the lock as a timestamp. (ex. 5m for 5 minutes)'),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('server')
            .setDescription('Lock the server. Run /unlock server to unlock it again.')
            .addStringOption((builder) => builder.setName('reason').setDescription('The reason for the lock.'))
            .addStringOption((builder) =>
               builder
                  .setName('duration')
                  .setDescription('The duration for the lock as a timestamp. (ex. 5m for 5 minutes)'),
            ),
      ),
   info: {
      module: Modules['Moderation'],
      description: 'Command for locking channels and server.',
      usageExample: '/lock (channel|server)',
      permission: 'moderation.lock',
   },
   subcommands: [lockChannel, lockServer],
   async execute() {
      return;
   },
};
