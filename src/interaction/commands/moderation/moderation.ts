import { SlashCommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import Modules from '@/constants/bot/commands/Modules';
import { moderationMuteRole } from '@/interaction/subcommands/moderation/moderation/moderationMuteRole';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('moderation')
      .setDescription("Command for managing Auxdibot's moderation settings.")
      .addSubcommand((builder) =>
         builder
            .setName('mute_role')
            .setDescription('Change the mute role for this server.')
            .addRoleOption((builder) => builder.setName('role').setDescription('The role to apply when muted.')),
      ),
   info: {
      module: Modules['Moderation'],
      description: "Command for managing Auxdibot's moderation settings.",
      usageExample: '/moderation (mute_role)',
      permission: 'moderation',
   },
   subcommands: [moderationMuteRole],
   async execute() {
      return;
   },
};
