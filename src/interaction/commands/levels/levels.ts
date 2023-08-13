import { ChannelType, SlashCommandBuilder } from 'discord.js';
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
import { setMessageXP } from '../../subcommands/levels/setMessageXP';
import { levelsToggleEmbed } from '@/interaction/subcommands/levels/levelsToggleEmbed';
import { levelsChannel } from '@/interaction/subcommands/levels/levelsChannel';
export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('levels')
      .setDescription('Change settings for leveling on this server.')
      .addSubcommand((builder) =>
         builder
            .setName('stats')
            .setDescription("View you or another member's level stats on this server.")
            .addUserOption((argBuilder) => argBuilder.setName('user').setDescription('The user to view.')),
      )
      .addSubcommand((builder) =>
         builder.setName('leaderboard').setDescription('View the leaderboard for this server.'),
      )
      .addSubcommand((builder) =>
         builder
            .setName('add_reward')
            .setDescription('Add a reward to the Level Rewards.')
            .addNumberOption((argBuilder) =>
               argBuilder.setName('level').setDescription('The level at which this reward is given.').setRequired(true),
            )
            .addRoleOption((argBuilder) =>
               argBuilder.setName('role').setDescription('The role that is given.').setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('remove_reward')
            .setDescription('Remove a reward from the Level Rewards.')
            .addNumberOption((argBuilder) =>
               argBuilder.setName('level').setDescription('The level at which this reward is given.').setRequired(true),
            ),
      )
      .addSubcommand((builder) => builder.setName('rewards').setDescription('View the Level Rewards for this server.'))
      .addSubcommand((builder) =>
         builder
            .setName('award_xp')
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
            .setName('remove_xp')
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
            .setDescription("Reset a user's level and XP..")
            .addUserOption((argBuilder) =>
               argBuilder.setName('user').setDescription('The user to be reset.').setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('message_xp')
            .setDescription('Set the amount of XP given for sending a message.')
            .addNumberOption((argBuilder) =>
               argBuilder.setName('xp').setDescription('The amount of XP to give.').setRequired(true),
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
      ),
   info: {
      module: Modules['Levels'],
      description: 'Change settings for leveling on this server.',
      usageExample:
         '/levels (leaderboard|add_reward|rewards|remove_reward|award_xp|reset|remove_xp|message_xp|toggle_embed|channel)',
      permission: 'levels',
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
      setMessageXP,
      levelsToggleEmbed,
      levelsChannel,
   ],
   async execute() {
      return;
   },
};
