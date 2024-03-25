import Modules from '@/constants/bot/commands/Modules';
import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import addReactionRole from '@/modules/features/roles/reaction_roles/addReactionRole';
import handleError from '@/util/handleError';
import parsePlaceholders from '@/util/parsePlaceholder';
import { testLimit } from '@/util/testLimit';
import { EmbedBuilder } from '@discordjs/builders';
import { APIEmbed, ReactionRoleType } from '@prisma/client';
import { ChannelType } from 'discord.js';

export const reactionRolesAddJSON = <AuxdibotSubcommand>{
   name: 'add_json',
   info: {
      module: Modules['Roles'],
      description: 'Add a reaction role to the server with custom Discord Embed JSON.',
      usageExample: '/reaction_roles add_json (channel) (roles) [type] (json)',
      permission: 'rr.add.json',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]),
         roles = interaction.options.getString('roles', true),
         json = interaction.options.getString('json', true),
         type = interaction.options.getString('type', false) || 'DEFAULT';

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
      const embed = JSON.parse(
         await parsePlaceholders(auxdibot, json || '', interaction.data.guild, interaction.data.member),
      ) satisfies APIEmbed;
      addReactionRole(
         auxdibot,
         interaction.guild,
         channel,
         embed.title,
         builder,
         embed,
         undefined,
         ReactionRoleType[type],
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
               typeof x.message == 'string' ? x.message : "Couldn't delete that permission override!",
               interaction,
            );
         });
   },
};
