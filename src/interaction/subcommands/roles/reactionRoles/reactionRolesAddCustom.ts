import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { toAPIEmbed } from '@/util/toAPIEmbed';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { EmbedBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord.js';
import addReactionRole from '@/modules/features/roles/reaction_roles/addReactionRole';
import { testLimit } from '@/util/testLimit';
import Limits from '@/constants/database/Limits';
import { ReactionRoleType } from '@prisma/client';

export const reactionRolesAddCustom = <AuxdibotSubcommand>{
   name: 'add_custom',
   info: {
      module: Modules['Roles'],
      description: 'Add a reaction role to the server with custom Embed parameters.',
      usageExample: '/reaction_roles add_custom (channel) (roles) [type] [...embed parameters]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]),
         roles = interaction.options.getString('roles', true),
         content = interaction.options.getString('content')?.replace(/\\n/g, '\n') || '',
         type = interaction.options.getString('type', false) || 'DEFAULT',
         webhook_url = interaction.options.getString('webhook_url');
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

      const split = roles.split(' ');
      const builder = [];
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
      const parameters = argumentsToEmbedParameters(interaction);
      addReactionRole(
         auxdibot,
         interaction.guild,
         channel,
         parameters.title,
         builder,
         toAPIEmbed(
            JSON.parse(
               await parsePlaceholders(auxdibot, JSON.stringify(parameters), {
                  guild: interaction.data.guild,
                  member: interaction.data.member,
               }),
            ),
         ),
         await parsePlaceholders(auxdibot, JSON.stringify(content), {
            guild: interaction.data.guild,
            member: interaction.data.member,
         }),
         ReactionRoleType[type],
         webhook_url,
      )
         .then(async () => {
            const resEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            resEmbed.title = '👈 Created Reaction Role';
            resEmbed.description = `Created a reaction role in ${channel}`;
            return await auxdibot.createReply(interaction, { embeds: [resEmbed] });
         })
         .catch(async (x) => {
            handleError(
               auxdibot,
               'REACTION_ROLE_CREATE_ERROR',
               typeof x.message == 'string' ? x.message : "Couldn't delete that reaction role!",
               interaction,
            );
         });
   },
};
