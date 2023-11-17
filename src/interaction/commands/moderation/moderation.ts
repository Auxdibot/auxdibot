import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { moderationMuteRole } from '@/interaction/subcommands/moderation/moderation/moderationMuteRole';
import { PunishmentType } from '@prisma/client';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';
import { blacklistAdd } from '@/interaction/subcommands/moderation/moderation/blacklist/blacklistAdd';
import { blacklistPunishment } from '@/interaction/subcommands/moderation/moderation/blacklist/blacklistPunishment';
import { blacklistList } from '@/interaction/subcommands/moderation/moderation/blacklist/blacklistList';
import { blacklistRemove } from '@/interaction/subcommands/moderation/moderation/blacklist/blacklistRemove';
import { warnsThreshold } from '@/interaction/subcommands/moderation/moderation/warns/warnsThreshold';
import { moderationSendReason } from '@/interaction/subcommands/moderation/moderation/moderationSendReason';
import { moderationSendModerator } from '@/interaction/subcommands/moderation/moderation/moderationSendModerator';
import { spamSet } from '@/interaction/subcommands/moderation/moderation/spam/spamSet';
import { spamPunishment } from '@/interaction/subcommands/moderation/moderation/spam/spamPunishment';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('moderation')
      .setDescription("Command for managing Auxdibot's moderation settings.")
      .addSubcommandGroup((builder) =>
         builder
            .setName('settings')
            .setDescription('Settings for moderation on this server.')
            .addSubcommand((builder) =>
               builder
                  .setName('mute_role')
                  .setDescription('Change the mute role for this server.')
                  .addRoleOption((builder) => builder.setName('role').setDescription('The role to apply when muted.')),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('send_reason')
                  .setDescription('Change whether users are sent the reason for their punishment.')
                  .addBooleanOption((builder) =>
                     builder
                        .setName('send')
                        .setDescription('Whether users are sent the reason for their punishment.')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('send_moderator')
                  .setDescription('Change whether users are sent the name of the moderator that punished them.')
                  .addBooleanOption((builder) =>
                     builder
                        .setName('send')
                        .setDescription('Whether users are sent the name of the moderator that punished them.')
                        .setRequired(true),
                  ),
            ),
      )
      .addSubcommandGroup((builder) =>
         builder
            .setName('exceptions')
            .setDescription('Settings for automod role exceptions on this server.')
            .addSubcommand((builder) =>
               builder
                  .setName('add')
                  .setDescription(
                     'Add a role exception to automod. The role added will not be affected by limits or blackisted words.',
                  )
                  .addRoleOption((builder) =>
                     builder
                        .setName('role')
                        .setDescription('The role to add as an exception to automod..')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('remove')
                  .setDescription('Remove a role exception to automod.')
                  .addRoleOption((builder) =>
                     builder
                        .setName('role')
                        .setDescription('The role to add as an exception to automod..')
                        .setRequired(true),
                  ),
            ),
      )
      .addSubcommandGroup((builder) =>
         builder
            .setName('warns')
            .setDescription('Settings for attachments on this server.')
            .addSubcommand((builder) =>
               builder
                  .setName('threshold')
                  .setDescription(
                     'Set the punishment to give for receiving warns on your server. (set warns to 0 to disable)',
                  )
                  .addStringOption((builder) =>
                     builder
                        .setName('punishment')
                        .setDescription('The punishment to use when the warns threshold is exceeded.')
                        .setChoices(
                           ...[PunishmentType.MUTE, PunishmentType.BAN, PunishmentType.KICK].map((i) => ({
                              name: PunishmentValues[i].title,
                              value: i,
                           })),
                        )
                        .setRequired(true),
                  )
                  .addNumberOption((builder) =>
                     builder
                        .setName('warns')
                        .setDescription(
                           'The total amount of warns needed to trigger the punishment. (set to 0 to turn off threshold)',
                        )
                        .setRequired(true),
                  ),
            ),
      )
      .addSubcommandGroup((builder) =>
         builder
            .setName('attachments')
            .setDescription('Settings for attachments on this server.')
            .addSubcommand((builder) =>
               builder
                  .setName('allow')
                  .setDescription('Set whether attachments are allowed on this server.')
                  .addBooleanOption((builder) =>
                     builder.setName('allowed').setDescription('Whether invites are allowed on this server.'),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('set')
                  .setDescription('Set the attachments spam limit for this server.')
                  .addNumberOption((builder) =>
                     builder
                        .setName('invites')
                        .setDescription('The amount of attachments that are sent.')
                        .setRequired(true),
                  )
                  .addNumberOption((builder) =>
                     builder
                        .setName('duration')
                        .setDescription('The duration of time the attachments must be sent over (in seconds).')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('punishment')
                  .setDescription('Set the punishment for attachments spam on this server.')
                  .addStringOption((builder) =>
                     builder
                        .setName('punishment')
                        .setDescription('The punishment to use when the attachments limit is exceeded.')
                        .setChoices(
                           ...Object.keys(PunishmentType)
                              .slice(1, 5)
                              .map((i) => ({ name: PunishmentValues[i].title, value: i })),
                        )
                        .setRequired(true),
                  )
                  .addStringOption((builder) =>
                     builder
                        .setName('reason')
                        .setDescription(
                           'The reason to give for the punishment when the attachments limit is exceeded.',
                        ),
                  ),
            ),
      )
      .addSubcommandGroup((builder) =>
         builder
            .setName('spam')
            .setDescription('Settings for spam on this server.')
            .addSubcommand((builder) =>
               builder
                  .setName('set')
                  .setDescription('Set the spam limit for this server.')
                  .addNumberOption((builder) =>
                     builder
                        .setName('messages')
                        .setDescription('The amount of messages that are sent.')
                        .setRequired(true),
                  )
                  .addNumberOption((builder) =>
                     builder
                        .setName('duration')
                        .setDescription('The duration of time the messages must be sent over (in seconds).')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('punishment')
                  .setDescription('Set the punishment for spam on this server.')
                  .addStringOption((builder) =>
                     builder
                        .setName('punishment')
                        .setDescription('The punishment to use when the spam limit is exceeded.')
                        .setChoices(
                           ...Object.keys(PunishmentType)
                              .slice(1, 5)
                              .map((i) => ({ name: PunishmentValues[i].title, value: i })),
                        )
                        .setRequired(true),
                  )
                  .addStringOption((builder) =>
                     builder
                        .setName('reason')
                        .setDescription('The reason to give for the punishment when the spam limit is exceeded.'),
                  ),
            ),
      )
      .addSubcommandGroup((builder) =>
         builder
            .setName('invites')
            .setDescription('Settings for invites on this server.')
            .addSubcommand((builder) =>
               builder
                  .setName('allow')
                  .setDescription('Set whether invites are allowed on this server.')
                  .addBooleanOption((builder) =>
                     builder.setName('allowed').setDescription('Whether invites are allowed on this server.'),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('set')
                  .setDescription('Set the invite spam limit for this server.')
                  .addNumberOption((builder) =>
                     builder
                        .setName('invites')
                        .setDescription('The amount of invites that are sent.')
                        .setRequired(true),
                  )
                  .addNumberOption((builder) =>
                     builder
                        .setName('duration')
                        .setDescription('The duration of time the invites must be sent over (in seconds).')
                        .setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('punishment')
                  .setDescription('Set the punishment for invite spam on this server.')
                  .addStringOption((builder) =>
                     builder
                        .setName('punishment')
                        .setDescription('The punishment to use when the invite limit is exceeded.')
                        .setChoices(
                           ...Object.keys(PunishmentType)
                              .slice(1, 5)
                              .map((i) => ({ name: PunishmentValues[i].title, value: i })),
                        )
                        .setRequired(true),
                  )
                  .addStringOption((builder) =>
                     builder
                        .setName('reason')
                        .setDescription('The reason to give for the punishment when the invite limit is exceeded.'),
                  ),
            ),
      )
      .addSubcommandGroup((builder) =>
         builder
            .setName('blacklist')
            .setDescription('Settings for the word blacklist for this server.')
            .addSubcommand((builder) =>
               builder
                  .setName('add')
                  .setDescription('Add a blacklisted phrase to this server.')
                  .addStringOption((builder) =>
                     builder.setName('phrase').setDescription('The phrase to censor.').setRequired(true),
                  ),
            )
            .addSubcommand((builder) =>
               builder.setName('list').setDescription('See a list of every blacklisted word on this server.'),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('remove')
                  .setDescription('Remove a blacklisted phrase from the server.')
                  .addStringOption((builder) =>
                     builder.setName('phrase').setDescription('The phrase to remove from the blacklist.'),
                  )
                  .addNumberOption((builder) =>
                     builder
                        .setName('index')
                        .setDescription(
                           'The index of the phrase to remove from the blacklist. (overrides blacklist option)',
                        ),
                  ),
            )
            .addSubcommand((builder) =>
               builder
                  .setName('punishment')
                  .setDescription('Set the punishment given when a blacklisted word is used.')
                  .addStringOption((builder) =>
                     builder
                        .setName('punishment')
                        .setDescription('The punishment to use when a blacklisted word is used.')
                        .setChoices(
                           ...Object.keys(PunishmentType).map((i) => ({ name: PunishmentValues[i].title, value: i })),
                        )
                        .setRequired(true),
                  ),
            ),
      ),
   info: {
      module: Modules['Moderation'],
      description: "Command for managing Auxdibot's moderation settings.",
      usageExample: '/moderation (settings|blacklist|attachments|invites|warns|spam|exceptions)',
      permission: 'moderation',
   },
   subcommands: [
      moderationMuteRole,
      blacklistAdd,
      blacklistPunishment,
      blacklistList,
      blacklistRemove,
      warnsThreshold,
      moderationSendReason,
      moderationSendModerator,
      spamSet,
      spamPunishment,
   ],
   async execute() {
      return;
   },
};
