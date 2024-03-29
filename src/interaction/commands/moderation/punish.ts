import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { punishWarn } from '@/interaction/subcommands/moderation/punish/punishWarn';
import { punishMute } from '@/interaction/subcommands/moderation/punish/punishMute';
import { punishKick } from '@/interaction/subcommands/moderation/punish/punishKick';
import { punishBan } from '@/interaction/subcommands/moderation/punish/punishBan';
import { punishUnban } from '@/interaction/subcommands/moderation/punish/punishUnban';
import { punishUnmute } from '@/interaction/subcommands/moderation/punish/punishUnmute';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('punish')
      .setDescription('Punish a user using Auxdibot.')
      .addSubcommand((builder) =>
         builder
            .setName('warn')
            .setDescription('Warn a user using Auxdibot.')
            .addUserOption((builder) =>
               builder.setName('user').setDescription('User that will be warned.').setRequired(true),
            )
            .addStringOption((builder) =>
               builder.setName('reason').setDescription('Reason for warn').setRequired(false),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('mute')
            .setDescription('Mute a user using Auxdibot.')
            .addUserOption((builder) =>
               builder.setName('user').setDescription('User that will be muted.').setRequired(true),
            )
            .addStringOption((builder) =>
               builder.setName('reason').setDescription('Reason for muted').setRequired(false),
            )
            .addStringOption((builder) =>
               builder.setName('duration').setDescription('Duration as a timestamp').setRequired(false),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('kick')
            .setDescription('Kick a user using Auxdibot.')
            .addUserOption((builder) =>
               builder.setName('user').setDescription('User that will be kicked.').setRequired(true),
            )
            .addStringOption((builder) =>
               builder.setName('reason').setDescription('Reason for kick').setRequired(false),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('ban')
            .setDescription('Ban a user using Auxdibot.')
            .addUserOption((builder) =>
               builder.setName('user').setDescription('User that will be banned.').setRequired(true),
            )
            .addStringOption((builder) => builder.setName('reason').setDescription('Reason for ban').setRequired(false))
            .addStringOption((builder) =>
               builder.setName('duration').setDescription('Duration as a timestamp').setRequired(false),
            )
            .addNumberOption((builder) =>
               builder
                  .setName('delete_message_days')
                  .setDescription("How many days back the user's messages should be deleted.")
                  .setRequired(false),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('unban')
            .setDescription('Unban a user.')
            .addUserOption((builder) =>
               builder
                  .setName('user')
                  .setDescription('The user to be unbanned. Use their Discord user ID.')
                  .setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('unmute')
            .setDescription('Unmute a user.')
            .addUserOption((builder) =>
               builder.setName('user').setDescription('The user to be unmuted.').setRequired(true),
            ),
      ),
   info: {
      module: Modules['Moderation'],
      description:
         'Warns a user, giving them a DM warning (if they have DMs enabled) and adding a warn to their record on the server.',
      usageExample: '/punish (warn|mute|kick|ban|unban|unmute) (user) [reason] {additional arguments}',
   },
   subcommands: [punishWarn, punishMute, punishKick, punishBan, punishUnban, punishUnmute],
   async execute() {
      return;
   },
};
