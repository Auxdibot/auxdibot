import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import setMuteRole from '@/modules/features/moderation/setMuteRole';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';

export const moderationMuteRole = <AuxdibotSubcommand>{
   name: 'mute_role',
   group: 'settings',
   info: {
      module: Modules['Moderation'],
      description: 'Change the mute role for the server, which is automatically assigned to muted users.',
      usageExample: '/moderation mute_role (role)',
      permission: 'moderation.mute_role',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const role = interaction.options.getRole('role');
      const server = interaction.data.guildData;
      if (
         interaction.data.member.id != interaction.data.guild.ownerId &&
         interaction.data.guild.roles.comparePositions(interaction.data.member.roles.highest, role.id) <= 0
      ) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This role is higher than yours!`;
         return await interaction.reply({
            embeds: [noPermissionEmbed],
            ephemeral: true,
         });
      }
      if (role && interaction.data.guild.roles.comparePositions(interaction.data.member.roles.highest, role.id) <= 0) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = `This role is higher up on the role hierarchy than Auxdibot's roles!`;
         return await interaction.reply({
            embeds: [noPermissionEmbed],
            ephemeral: true,
         });
      }
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = '⚙️ Mute Role Change';
      if (role && role.id == server.mute_role) {
         embed.description = `Nothing changed. Mute role is the same as one specified in settings.`;
         return await interaction.reply({
            embeds: [embed],
         });
      }
      const formerRole = interaction.data.guild.roles.cache.get(server.mute_role || ''),
         guildRole = role ? interaction.data.guild.roles.cache.get(role.id) : null;
      if (guildRole) {
         await guildRole.setPermissions([], 'Clearing all permissions.').catch(() => undefined);
         interaction.data.guild.channels.cache.forEach((r) => {
            if (r.isDMBased() || r.isThread() || !guildRole) return;
            r.permissionOverwrites.create(guildRole, {
               SendMessages: false,
               SendMessagesInThreads: false,
               AddReactions: false,
            });
            if (r.isVoiceBased())
               r.permissionOverwrites.create(guildRole, {
                  Connect: false,
               });
         });
      }
      setMuteRole(auxdibot, interaction.guild, interaction.user, role)
         .then(async () => {
            embed.description = `The mute role for this server has been changed.\r\n\r\nFormerly: ${
               formerRole ? `<@&${formerRole.id}>` : 'None (Timeout)'
            }\r\n\r\nNow: ${role ? `<@&${role.id}>` : 'None (Timeout)'}`;
            return await interaction.reply({
               embeds: [embed],
            });
         })
         .catch((x) => {
            handleError(
               auxdibot,
               'ERROR_SET_MUTE_ROLE',
               typeof x.message == 'string' ? x.message : "couldn't set the mute role",
               interaction,
            );
         });
   },
};
