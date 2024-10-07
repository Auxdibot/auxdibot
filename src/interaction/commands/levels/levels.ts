import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { addLevelReward } from '../../subcommands/levels/addLevelReward';
import { removeLevelReward } from '../../subcommands/levels/removeLevelReward';
import { levelRewards } from '../../subcommands/levels/levelRewards';
import { levelsAwardXP } from '../../subcommands/levels/levelsAwardXP';
import { levelsRemoveXP } from '../../subcommands/levels/levelsRemoveXP';
import { resetLevels } from '../../subcommands/levels/resetLevels';
import { levelsStats } from '../../subcommands/levels/levelsStats';
import { levelsLeaderboard } from '../../subcommands/levels/levelsLeaderboard';
import { levelsSetMessageXP } from '../../subcommands/levels/levelsSetMessageXP';
import { levelsToggleEmbed } from '@/interaction/subcommands/levels/levelsToggleEmbed';
import { levelsChannel } from '@/interaction/subcommands/levels/levelsChannel';
import { resetAllLevels } from '@/interaction/subcommands/levels/resetAllLevels';
import { levelMessage } from '@/interaction/subcommands/levels/levelMessage';
import { levelReset } from '@/interaction/subcommands/levels/levelReset';
import { levelPreview } from '@/interaction/subcommands/levels/levelPreview';
import levelsExportCSV from '@/interaction/subcommands/levels/levelsExportCSV';
import levelsImportCSV from '@/interaction/subcommands/levels/levelsImportCSV';
import { levelsSetEventXP } from '@/interaction/subcommands/levels/levelsSetEventXP';
import { levelsAddChannelMultiplier } from '@/interaction/subcommands/levels/levelsAddChannelMultiplier';
import { levelsRemoveChannelMultiplier } from '@/interaction/subcommands/levels/levelsRemoveChannelMultiplier';
import { levelsAddRoleMultiplier } from '@/interaction/subcommands/levels/levelsAddRoleMultiplier';
import { levelsRemoveRoleMultiplier } from '@/interaction/subcommands/levels/levelsRemoveRoleMultiplier';
import { levelMultipliers } from '@/interaction/subcommands/levels/levelsMultipliers';
import { levelsSetGlobalMultiplier } from '@/interaction/subcommands/levels/levelsSetGlobalMultiplier';
import { levelsSetStarboardXP } from '@/interaction/subcommands/levels/levelsSetStarboardXP';
import { levelsSetVoiceXP } from '@/interaction/subcommands/levels/levelsSetVoiceXP';
import { levelsLeaderboardVisibility } from '@/interaction/subcommands/levels/levelsLeaderboardVisibility';
import levelsDisableMessages from '@/interaction/subcommands/levels/levelsDisableMessages';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('levels')
      .setDescription('Change settings for leveling on this server.')
      .addSubcommand((builder) =>
         builder
            .setName('disable_messages')
            .setDescription('Disable levelup messages sent by Auxdibot to you.')
            .addBooleanOption((argBuilder) =>
               argBuilder.setName('disabled').setDescription('Whether to disable levelup messages.').setRequired(true),
            ),
      )
      .addSubcommandGroup((group) =>
         group
            .setName('xp')
            .setDescription('XP related commands')
            .addSubcommand((builder) =>
               builder
                  .setName('award')
                  .setDescription('Award a user XP points.')
                  .addNumberOption((argBuilder) =>
                     argBuilder.setName('xp').setDescription('How much XP is awarded.').setRequired(true),
                  )
                  .addUserOption((argBuilder) =>
                     argBuilder.setName('user').setDescription('The user to award the XP to.').setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('remove')
                  .setDescription('Remove XP points from a user.')
                  .addNumberOption((argBuilder) =>
                     argBuilder.setName('xp').setDescription('How much XP is removed.').setRequired(true),
                  )
                  .addUserOption((argBuilder) =>
                     argBuilder.setName('user').setDescription('The user to remove the XP from.').setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('reset')
                  .setDescription("Reset a user's level and XP.")
                  .addUserOption((argBuilder) =>
                     argBuilder.setName('user').setDescription('The user to be reset.').setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('reset_all')
                  .setDescription("Reset every member's level and XP. (WARNING: THIS CANNOT BE RECOVERED)"),
            ),
      )
      .addSubcommandGroup((group) =>
         group
            .setName('rewards')
            .setDescription('Reward related commands')
            .addSubcommand((builder) =>
               builder
                  .setName('add')
                  .setDescription('Add a reward to the Level Rewards.')
                  .addNumberOption((argBuilder) =>
                     argBuilder
                        .setName('level')
                        .setDescription('The level at which this reward is given.')
                        .setRequired(true),
                  )
                  .addRoleOption((argBuilder) =>
                     argBuilder.setName('role').setDescription('The role that is given.').setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('remove')
                  .setDescription('Remove a reward from the Level Rewards.')
                  .addIntegerOption((argBuilder) =>
                     argBuilder.setName('level').setDescription('The level at which this reward is given.'),
                  )
                  .addIntegerOption((argBuilder) =>
                     argBuilder.setName('index').setDescription('The index of the reward to remove from the list.'),
                  ),
            )
            .addSubcommand((builder) =>
               builder.setName('list').setDescription('List the Level Rewards for this server.'),
            ),
      )
      .addSubcommandGroup((group) =>
         group
            .setName('stats')
            .setDescription('Stats related commands')
            .addSubcommand((builder) =>
               builder
                  .setName('level')
                  .setDescription("View your or another member's level stats on this server.")
                  .addUserOption((argBuilder) =>
                     argBuilder.setName('user').setDescription('The user to check the level of.'),
                  ),
            )
            .addSubcommand((builder) =>
               builder.setName('leaderboard').setDescription('View the leaderboard for this server.'),
            ),
      )
      .addSubcommandGroup((group) =>
         group
            .setName('settings')
            .setDescription('Settings related commands')
            .addSubcommand((builder) =>
               builder
                  .setName('message_xp')
                  .setDescription('Set the amount of XP given for sending a message.')
                  .addStringOption((argBuilder) =>
                     argBuilder
                        .setName('xp')
                        .setDescription('The amount of XP to give. (ex. "15", or "15-50")')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('event_xp')
                  .setDescription('Set the amount of XP given for attending an event on your Discord server.')
                  .addStringOption((argBuilder) =>
                     argBuilder
                        .setName('xp')
                        .setDescription('The amount of XP to give. (ex. "15", or "15-50")')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('voice_xp')
                  .setDescription(
                     'Set the amount of XP given for being in a voice channel on your Discord server for 1 minute.',
                  )
                  .addStringOption((argBuilder) =>
                     argBuilder
                        .setName('xp')
                        .setDescription('The amount of XP to give. (ex. "15", or "15-50")')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('starboard_xp')
                  .setDescription("Set the amount of XP given for a message being starred on the server's starboard.")
                  .addStringOption((argBuilder) =>
                     argBuilder
                        .setName('xp')
                        .setDescription('The amount of XP to give. (ex. "15", or "15-50")')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('toggle_embed')
                  .setDescription('Toggle whether the Level embed is sent upon a user leveling up.'),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('channel')
                  .setDescription('The channel to post level messages in.')
                  .addChannelOption((argBuilder) =>
                     argBuilder
                        .setName('channel')
                        .setDescription(
                           'Levelup messages channel, or leave empty for Auxdibot to reply to the current message.',
                        )
                        .addChannelTypes(ChannelType.GuildText),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('leaderboard_visibility')
                  .setDescription('Toggle whether the leaderboard can be viewed online.')
                  .addBooleanOption((argBuilder) =>
                     argBuilder
                        .setName('visibility')
                        .setDescription('Whether the leaderboard can be viewed online.')
                        .setRequired(true),
                  ),
            ),
      )
      .addSubcommandGroup((group) =>
         group
            .setName('message')
            .setDescription('Message related commands')
            .addSubcommand((builder) =>
               builder
                  .setName('set')
                  .setDescription('Set the message to be sent when a user levels up.')
                  .addStringOption((argBuilder) =>
                     argBuilder
                        .setName('id')
                        .setDescription('The ID of the stored embed to use. (/embed storage list)'),
                  ),
            )
            .addSubcommand((builder) => builder.setName('reset').setDescription('Reset the message to the default.'))
            .addSubcommand((builder) =>
               builder.setName('preview').setDescription('Preview the message that will be sent.'),
            ),
      )
      .addSubcommandGroup((group) =>
         group
            .setName('data')
            .setDescription('Command for exporting and importing level data with Auxdibot.')
            .addSubcommand((builder) =>
               builder.setName('export_csv').setDescription('Export the levels data to a CSV file.'),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('import_csv')
                  .setDescription('Import the levels data from a CSV file.')
                  .addAttachmentOption((input) =>
                     input.setName('csv').setDescription('The CSV file to import.').setRequired(true),
                  )
                  .addBooleanOption((input) =>
                     input
                        .setName('show_errors')
                        .setDescription(
                           'Whether to show issues with invalid data in the CSV file. (Errors will stop import process.)',
                        ),
                  ),
            ),
      )
      .addSubcommandGroup((group) =>
         group
            .setName('multipliers')
            .setDescription('Multiplier related commands')
            .addSubcommand((builder) =>
               builder
                  .setName('add_role')
                  .setDescription('Add a role to the multiplier list.')
                  .addRoleOption((argBuilder) =>
                     argBuilder
                        .setName('role')
                        .setDescription('The role to add to the multiplier list.')
                        .setRequired(true),
                  )
                  .addNumberOption((argBuilder) =>
                     argBuilder
                        .setName('multiplier')
                        .setDescription('The multiplier to apply to the role.')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('remove_role')
                  .setDescription('Remove a role from the multiplier list.')
                  .addRoleOption((argBuilder) =>
                     argBuilder.setName('role').setDescription('The role to remove from the multiplier list.'),
                  )
                  .addIntegerOption((argBuilder) =>
                     argBuilder
                        .setName('index')
                        .setDescription('The index of the role to remove from the multiplier list.'),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('set_global')
                  .setDescription('Set the global multiplier for the server.')
                  .addNumberOption((argBuilder) =>
                     argBuilder
                        .setName('multiplier')
                        .setDescription('The multiplier to apply to the server. (Default: 1)'),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('add_channel')
                  .setDescription('Add a channel multiplier.')
                  .addChannelOption((argBuilder) =>
                     argBuilder
                        .setName('channel')
                        .setDescription('The channel to add to the multiplier list.')
                        .addChannelTypes(
                           ChannelType.GuildAnnouncement,
                           ChannelType.GuildText,
                           ChannelType.GuildVoice,
                           ChannelType.GuildStageVoice,
                        )
                        .setRequired(true),
                  )
                  .addNumberOption((argBuilder) =>
                     argBuilder
                        .setName('multiplier')
                        .setDescription('The multiplier to apply to the channel.')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('remove_channel')
                  .setDescription('Remove a channel multiplier.')
                  .addChannelOption((argBuilder) =>
                     argBuilder
                        .setName('channel')
                        .setDescription('The channel to remove from the multiplier list.')
                        .addChannelTypes(
                           ChannelType.GuildAnnouncement,
                           ChannelType.GuildText,
                           ChannelType.GuildVoice,
                           ChannelType.GuildStageVoice,
                        ),
                  )
                  .addIntegerOption((argBuilder) =>
                     argBuilder
                        .setName('index')
                        .setDescription('The index of the channel to remove from the multiplier list.'),
                  ),
            )
            .addSubcommand((builder) => builder.setName('list').setDescription('List all multipliers on your server.')),
      ),
   info: {
      module: Modules['Levels'],
      description: 'Change settings for leveling on this server.',
      usageExample: '/levels (settings|message|multipliers|data|rewards|xp|stats|disable_messages)',
      permissionsRequired: [PermissionFlagsBits.ManageGuild],
   },
   subcommands: [
      addLevelReward,
      removeLevelReward,
      levelRewards,
      levelsAwardXP,
      levelsRemoveXP,
      resetLevels,
      levelsStats,
      levelsLeaderboard,
      levelsSetMessageXP,
      levelsToggleEmbed,
      levelsChannel,
      resetAllLevels,
      levelMessage,
      levelReset,
      levelPreview,
      levelsExportCSV,
      levelsImportCSV,
      levelsSetEventXP,
      levelsAddChannelMultiplier,
      levelsRemoveChannelMultiplier,
      levelsAddRoleMultiplier,
      levelsRemoveRoleMultiplier,
      levelMultipliers,
      levelsSetGlobalMultiplier,
      levelsSetStarboardXP,
      levelsSetVoiceXP,
      levelsLeaderboardVisibility,
      levelsDisableMessages,
   ],
   async execute() {
      return;
   },
};
