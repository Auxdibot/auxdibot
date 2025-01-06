import Modules from '@/constants/bot/commands/Modules';
import { acceptAppeal } from '@/interaction/subcommands/moderation/appeals/acceptAppeal';
import { denyAppeal } from '@/interaction/subcommands/moderation/appeals/denyAppeal';
import { viewAppeals } from '@/interaction/subcommands/moderation/appeals/viewAppeals';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('appeals')
      .setDescription('View all appeals that have been made on the server.')
      .addSubcommand((builder) =>
         builder.setName('view').setDescription('View all appeals that are currently pending on the server.'),
      )
      .addSubcommand((builder) =>
         builder
            .setName('accept')
            .setDescription('Accept an appeal that has been made on the server.')
            .addIntegerOption((option) =>
               option
                  .setName('punishment_id')
                  .setDescription('The punishment ID for the appeal you want to accept.')
                  .setRequired(true),
            )
            .addStringOption((option) =>
               option.setName('reason').setDescription('The reason for accepting this appeal.').setRequired(true),
            ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('deny')
            .setDescription('Deny an appeal that has been made on the server.')
            .addIntegerOption((option) =>
               option
                  .setName('punishment_id')
                  .setDescription('The punishment ID for the appeal you want to deny.')
                  .setRequired(true),
            )
            .addStringOption((option) =>
               option.setName('reason').setDescription('The reason for denying this appeal.').setRequired(true),
            ),
      )
      .setContexts(InteractionContextType.Guild),
   info: {
      module: Modules['Moderation'],
      description: 'View all appeals that have been made on the server.',
      allowedDefault: false,
      dmableCommand: false,
      usageExample: '/appeals (accept|deny|view)',
      premium: 'guild',
      permissionsRequired: [PermissionFlagsBits.ModerateMembers],
   },
   subcommands: [denyAppeal, acceptAppeal, viewAppeals],
};
