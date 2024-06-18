import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { unlockChannel } from '@/interaction/subcommands/moderation/unlock/unlockChannel';
import { unlockServer } from '@/interaction/subcommands/moderation/unlock/unlockServer';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('unlock')
      .setDescription('Command for unlocking channels and server.')
      .addSubcommand((builder) =>
         builder
            .setName('channel')
            .setDescription('Unlock a channel. Run /lock channel to lock it again.')
            .addChannelOption((builder) =>
               builder
                  .setName('channel')
                  .setDescription('The channel to unlock.')
                  .addChannelTypes(
                     ChannelType.GuildText,
                     ChannelType.GuildAnnouncement,
                     ChannelType.GuildForum,
                     ChannelType.GuildVoice,
                     ChannelType.PublicThread,
                     ChannelType.PrivateThread,
                     ChannelType.AnnouncementThread,
                  ),
            ),
      )
      .addSubcommand((builder) =>
         builder.setName('server').setDescription('Unlock the server. Run /unlock server to unlock it again.'),
      ),
   info: {
      module: Modules['Moderation'],
      description: 'Command for unlocking channels and server.',
      usageExample: '/unlock (channel|server)',
      permissionsRequired: [PermissionFlagsBits.ManageChannels],
   },
   subcommands: [unlockChannel, unlockServer],
   async execute() {
      return;
   },
};
