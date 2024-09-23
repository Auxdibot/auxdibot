import Modules from '@/constants/bot/commands/Modules';
import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import addReactionRole from '@/modules/features/roles/reaction_roles/addReactionRole';
import handleError from '@/util/handleError';

import { testLimit } from '@/util/testLimit';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction, ReactionRoleType } from '@prisma/client';
import { ChannelType } from 'discord.js';

export const reactionRolesAddPremade = <AuxdibotSubcommand>{
   name: 'add_premade',
   info: {
      module: Modules['Roles'],
      description: 'Add a reaction role to the server with a premade embed.',
      usageExample: '/reaction_roles add_premade (channel) (roles) [type]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]),
         roles = interaction.options.getString('roles', true),
         title = interaction.options.getString('title') || 'React to receive roles!',
         type = interaction.options.getString('type', false) || 'DEFAULT',
         webhook_url = interaction.options.getString('webhook_url');
      const split = roles.split(' ');
      const builder = [];
      if (!testLimit(interaction.data.guildData.reaction_roles, Limits.REACTION_ROLE_DEFAULT_LIMIT)) {
         return await handleError(
            auxdibot,
            'REACTION_ROLES_LIMIT_EXCEEDED',
            'There are too many reaction roles!',
            interaction,
         );
      }
      if (!ReactionRoleType[type]) {
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
      addReactionRole(
         auxdibot,
         interaction.guild,
         channel,
         title,
         builder,
         undefined,
         undefined,
         ReactionRoleType[type],
         webhook_url,
      )
         .then(async () => {
            const resEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            resEmbed.title = '👈 Created Reaction Role';
            resEmbed.description = `Created a reaction role in ${channel}`;
            auxdibot.log(interaction.data.guild, {
               userID: interaction.data.member.id,
               description: `Created a reaction role in ${channel.name}`,
               type: LogAction.REACTION_ROLE_ADDED,
               date: new Date(),
            });
            return await auxdibot.createReply(interaction, { embeds: [resEmbed] });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'REACTION_ROLE_CREATE_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't create that reaction role!",
               interaction,
            );
         });
   },
};
