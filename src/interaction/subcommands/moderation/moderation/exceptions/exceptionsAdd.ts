import Modules from '@/constants/bot/commands/Modules';
import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { addAutoModException } from '@/modules/features/moderation/exceptions/addAutoModException';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
import { PermissionsBitField } from 'discord.js';

export const exceptionsAdd = <AuxdibotSubcommand>{
   name: 'add',
   group: 'exceptions',
   info: {
      module: Modules['Moderation'],
      description:
         'Add a role exception to automod. The role added will not be affected by limits or blackisted words.',
      usageExample: '/moderation exceptions add (role)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data || !interaction.memberPermissions) return;
      const server = interaction.data.guildData;
      const role = interaction.options.getRole('role', true);
      if (role.id == interaction.data.guild.roles.everyone.id) {
         return await handleError(auxdibot, 'EXCEPTIONS_EVERYONE', 'This is the everyone role, silly!', interaction);
      }
      if (server.join_roles.find((val: string) => role != null && val == role.id)) {
         return await handleError(
            auxdibot,
            'EXCEPTION_EXISTS',
            'This role is already added as an AutoMod exception!',
            interaction,
         );
      }
      if (
         interaction.data.member.id != interaction.data.guild.ownerId &&
         !interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator) &&
         role.position >= interaction.data.member.roles.highest.position
      ) {
         return await handleError(
            auxdibot,
            'ROLE_POSITION_HIGHER',
            'This role has a higher or equal position than your highest role!',
            interaction,
         );
      }
      if (
         interaction.data.guild.members.me &&
         role.position >= interaction.data.guild.members.me.roles.highest.position
      ) {
         return await handleError(
            auxdibot,
            'ROLE_POSITION_HIGHER_BOT',
            "This role has a higher position than Auxdibot's highest role!",
            interaction,
         );
      }
      if (!(await auxdibot.testLimit(server.join_roles, Limits.AUTOMOD_EXCEPTION_LIMIT, interaction.guild))) {
         return await handleError(
            auxdibot,
            'AUTOMOD_EXCEPTION_LIMIT_EXCEEDED',
            'You have too many exception roles!',
            interaction,
         );
      }
      await addAutoModException(auxdibot, interaction.guild, role, interaction.data.member.id)
         .then(async () => {
            const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            successEmbed.title = '🛡️ Added AutoMod Exception Role';
            successEmbed.description = `Added <@&${role.id}> to the AutoMod exception roles.`;
            return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
         })
         .catch(() => {
            handleError(
               auxdibot,
               'AUTOMOD_EXCEPTION_ADD_ERROR',
               "Couldn't add that role as an exception!",
               interaction,
            );
         });
   },
};
