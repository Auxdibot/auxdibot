import Modules from '@/constants/bot/commands/Modules';
import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { applyReactionsToMessages } from '@/modules/features/roles/reaction_roles/applyReactionsToMessage';
import { getMessage } from '@/util/getMessage';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import { testLimit } from '@/util/testLimit';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction, ReactionRoleType } from '@prisma/client';

export const reactionRolesAddMessage = <AuxdibotSubcommand>{
   name: 'add_message',
   info: {
      module: Modules['Roles'],
      description: 'Add a reaction role to the server using an existing message.',
      usageExample: '/reaction_roles add_message (messageID) (roles) [type]',
      permission: 'rr.add.message',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const messageID = interaction.options.getString('message', true),
         roles = interaction.options.getString('roles', true),
         type = interaction.options.getString('type', false) || 'DEFAULT';
      const split = roles.split(' ');
      const builder = [];
      const server = interaction.data.guildData;
      if (!testLimit(interaction.data.guildData.reaction_roles, Limits.REACTION_ROLE_DEFAULT_LIMIT)) {
         return await handleError(
            auxdibot,
            'REACTION_ROLES_LIMIT_EXCEEDED',
            'There are too many reaction roles!',
            interaction,
         );
      }
      if (
         !ReactionRoleType[type] ||
         !['DEFAULT', 'SELECT_ONE', 'STICKY', 'STICKY_SELECT_ONE'].includes(ReactionRoleType[type])
      ) {
         return await handleError(auxdibot, 'INVALID_TYPE', 'This is not a valid reaction role type!', interaction);
      }
      while (split.length) {
         const [emoji, roleID] = split.splice(0, 2);
         builder.push({ emoji, roleID });
      }
      if (builder.length > 10) {
         return await handleError(
            auxdibot,
            'TOO_MANY_REACTIONS',
            'You can only have up to 10 roles on one message!',
            interaction,
         );
      }
      const message = await getMessage(interaction.guild, messageID);
      if (!message || server.reaction_roles.find((i) => i.messageID == message.id)) {
         return await handleError(auxdibot, 'INVALID_MESSAGE', 'This is not a valid message!', interaction);
      }
      applyReactionsToMessages(auxdibot, interaction.guild, message, builder, ReactionRoleType[type])
         .then(async () => {
            const resEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            resEmbed.title = '👈 Applied Reaction Role';
            resEmbed.description = `Applied your reaction role to your message in ${message.channel}!`;
            handleLog(auxdibot, interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `Applied a reaction role to a message in ${message.channel}`,
               type: LogAction.REACTION_ROLE_ADDED,
               date_unix: Date.now(),
            });
            return await auxdibot.createReply(interaction, { embeds: [resEmbed] });
         })
         .catch((x) =>
            handleError(
               auxdibot,
               'REACTION_ROLE_CREATE_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't create that reaction role!",
               interaction,
            ),
         );
   },
};
