import { SlashCommandBuilder, ChannelType, SlashCommandSubcommandBuilder } from 'discord.js';
import AuxdibotCommand from '@/interfaces/commands/AuxdibotCommand';
import createEmbedParameters from '@/util/createEmbedParameters';
import Modules from '@/constants/bot/commands/Modules';
import { reactionRolesAdd } from '../../subcommands/roles/reactionRoles/reactionRolesAdd';
import { reactionRolesAddCustom } from '../../subcommands/roles/reactionRoles/reactionRolesAddCustom';
import { reactionRolesAddJSON } from '../../subcommands/roles/reactionRoles/reactionRolesAddJSON';
import { reactionRolesEdit } from '../../subcommands/roles/reactionRoles/reactionRolesEdit';
import { reactionRolesList } from '../../subcommands/roles/reactionRoles/reactionRolesList';
import { reactionRolesRemove } from '../../subcommands/roles/reactionRoles/reactionRolesRemove';
import { ReactionRoleType } from '@prisma/client';
import { ReactionRoleTypeNames } from '@/constants/bot/roles/ReactionRoleTypeNames';
import { reactionRolesAddMessage } from '@/interaction/subcommands/roles/reactionRoles/reactionRolesAddMessage';
const createRoleTypes = (builder: SlashCommandSubcommandBuilder) =>
   builder.addStringOption((builder) =>
      builder
         .setName('type')
         .setDescription('The way users will interact with this reaction role.')
         .setChoices(...Object.keys(ReactionRoleType).map((i) => ({ name: ReactionRoleTypeNames[i], value: i }))),
   );
export default <AuxdibotCommand>{
   data: new SlashCommandBuilder()
      .setName('reaction_roles')
      .setDescription('Create, edit, remove, or list the currently active reaction roles.')
      .addSubcommand((builder) =>
         createRoleTypes(
            builder
               .setName('add')
               .setDescription('Add a reaction role to the server.')
               .addChannelOption((argBuilder) =>
                  argBuilder
                     .setName('channel')
                     .setDescription('The channel to put the reaction role embed in.')
                     .addChannelTypes(ChannelType.GuildText)
                     .setRequired(true),
               )
               .addStringOption((argBuilder) =>
                  argBuilder
                     .setName('roles')
                     .setDescription('Space between emoji & role. (ex. [emoji] [role] [...emoji2] [...role2])')
                     .setRequired(true),
               )
               .addStringOption((argBuilder) =>
                  argBuilder.setName('title').setDescription('Title of the reaction roles.'),
               ),
         ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('add_message')
            .setDescription('Add a reaction role to the server using an existing message.')
            .addStringOption((argBuilder) =>
               argBuilder.setName('message').setDescription('The message to use as a reaction role.').setRequired(true),
            )
            .addStringOption((argBuilder) =>
               argBuilder
                  .setName('roles')
                  .setDescription('Space between emoji & role. (ex. [emoji] [role] [...emoji2] [...role2])')
                  .setRequired(true),
            )
            .addStringOption((builder) =>
               builder
                  .setName('type')
                  .setDescription('The way users will interact with this reaction role.')
                  .setChoices(
                     ...Object.keys(ReactionRoleType)
                        .filter((i) => ['DEFAULT', 'STICKY', 'SELECT_ONE', 'STICKY_SELECT_ONE'].includes(i))
                        .map((i) => ({ name: ReactionRoleTypeNames[i], value: i })),
                  ),
            ),
      )
      .addSubcommand((builder) =>
         createEmbedParameters(
            createRoleTypes(
               builder
                  .setName('add_custom')
                  .setDescription('Add a reaction role to the server.')
                  .addChannelOption((argBuilder) =>
                     argBuilder
                        .setName('channel')
                        .setDescription('The channel to put the reaction role embed in.')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true),
                  )
                  .addStringOption((argBuilder) =>
                     argBuilder
                        .setName('roles')
                        .setDescription('Space between emoji & role. (ex. [emoji] [role] [...emoji2] [...role2])')
                        .setRequired(true),
                  ),
            ),
         ),
      )
      .addSubcommand((builder) =>
         createRoleTypes(
            builder
               .setName('add_json')
               .setDescription('Add a reaction role to the server.')
               .addChannelOption((argBuilder) =>
                  argBuilder
                     .setName('channel')
                     .setDescription('The channel to put the reaction role embed in.')
                     .addChannelTypes(ChannelType.GuildText)
                     .setRequired(true),
               )
               .addStringOption((argBuilder) =>
                  argBuilder
                     .setName('roles')
                     .setDescription('Space between emoji & role. (ex. [emoji] [role] [...emoji2] [...role2])')
                     .setRequired(true),
               )
               .addStringOption((argBuilder) =>
                  argBuilder
                     .setName('json')
                     .setDescription('The JSON for the Discord Embed attached to the reaction role.')
                     .setRequired(true),
               ),
         ),
      )
      .addSubcommand((builder) =>
         builder
            .setName('remove')
            .setDescription('Remove a reaction role from the server.')
            .addStringOption((argBuilder) =>
               argBuilder.setName('message_id').setDescription('The message id of the reaction role.'),
            )
            .addNumberOption((argBuilder) =>
               argBuilder
                  .setName('index')
                  .setDescription(
                     'The index of the reaction role, which is the placement of the item on /reaction_roles list.',
                  ),
            ),
      )
      .addSubcommand((builder) =>
         createEmbedParameters(
            builder
               .setName('edit')
               .setDescription('Edit a reaction role embed on this server.')
               .addStringOption((argBuilder) =>
                  argBuilder.setName('message_id').setDescription('The message id of the reaction role.'),
               )
               .addNumberOption((argBuilder) =>
                  argBuilder
                     .setName('index')
                     .setDescription(
                        'The index of the reaction role, which is the placement of the item on /reaction_roles list.',
                     ),
               )
               .addStringOption((argBuilder) =>
                  argBuilder
                     .setName('json')
                     .setDescription(
                        'The JSON for the Discord Embed attached to the reaction role. (overrides embed parameters)',
                     ),
               ),
         ),
      )
      .addSubcommand((builder) => builder.setName('list').setDescription('List the reaction roles on this server.')),
   info: {
      module: Modules['Roles'],
      description: 'Create, edit, remove, or list the currently active reaction roles.',
      usageExample: '/reaction_roles (add|add_custom|add_json|add_message|remove|edit|list)',
   },
   subcommands: [
      reactionRolesAdd,
      reactionRolesAddCustom,
      reactionRolesAddJSON,
      reactionRolesAddMessage,
      reactionRolesEdit,
      reactionRolesList,
      reactionRolesRemove,
   ],
   async execute() {
      return;
   },
};
