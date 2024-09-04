import { ChannelType, EmbedBuilder, ModalSubmitInteraction, OverwriteResolvable } from 'discord.js';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import AuxdibotModal from '@/interfaces/modals/AuxdibotModal';
import handleError from '@/util/handleError';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import toggleModule from '@/modules/features/settings/toggleModule';
import { updateCommandPermissions } from '@/modules/features/commands/updateCommandPermissions';
import setReportsChannel from '@/modules/features/moderation/reports/setReportsChannel';
import setLogChannel from '@/modules/features/logging/setLogChannel';
import setReportRole from '@/modules/features/moderation/reports/setReportsRole';

export default <AuxdibotModal>{
   module: Modules['Settings'],
   name: 'moderation',
   command: 'setup moderation',
   async execute(auxdibot: Auxdibot, interaction: ModalSubmitInteraction) {
      if (!interaction.guildId) return;
      const server = await findOrCreateServer(auxdibot, interaction.guildId);
      const moderationMute = interaction.fields.getTextInputValue('moderation_mute'),
         moderationRole = interaction.fields.getTextInputValue('moderation_role'),
         moderationWarns = interaction.fields.getTextInputValue('moderation_warns'),
         moderationReports = interaction.fields.getTextInputValue('moderation_reports'),
         moderationLog = interaction.fields.getTextInputValue('moderation_logs');
      await interaction.deferReply();
      try {
         if (server.disabled_modules.includes('Moderation'))
            await toggleModule(auxdibot, interaction.guild, 'Moderation', true);
         let muteRole = undefined;
         if (moderationMute) {
            muteRole = await interaction.guild.roles.create({
               name: moderationMute,
               color: 'DarkRed',
            });
            interaction.guild.channels.cache.forEach((r) => {
               if ((r.type != ChannelType.GuildText && r.type != ChannelType.GuildVoice) || !muteRole) return;
               r.permissionOverwrites.create(muteRole, {
                  SendMessages: false,
                  SendMessagesInThreads: false,
                  AddReactions: false,
               });
               if (r.type == ChannelType.GuildVoice)
                  r.permissionOverwrites.create(muteRole, {
                     Connect: false,
                  });
            });
         }
         let warnsResult = undefined;
         if (moderationWarns) {
            if (
               !Number.isInteger(Number(moderationWarns)) ||
               Number.isNaN(Number(moderationWarns) || Number(moderationWarns) < 0)
            )
               throw new Error('This is an invalid warn threshold!');
            warnsResult = await auxdibot.database.servers.update({
               where: { serverID: server.serverID },
               data: { automod_punish_threshold_warns: Number(moderationWarns), automod_threshold_punishment: 'MUTE' },
               select: { automod_punish_threshold_warns: true, automod_threshold_punishment: true },
            });
         }
         let modRole = undefined;
         if (moderationRole) {
            modRole = await interaction.guild.roles.create({
               name: moderationRole,
            });
         }
         const permissionOverwrites: OverwriteResolvable[] = [
            {
               id: interaction.guild.roles.everyone.id,
               deny: ['ViewChannel'],
            },
         ];
         if (modRole)
            permissionOverwrites.push({
               id: modRole.id,
               allow: ['ViewChannel'],
            });
         let logChannel = undefined;
         if (moderationLog) {
            logChannel = await interaction.guild.channels.create({
               name: moderationLog,
               permissionOverwrites,
            });
         }
         let reportsChannel = undefined;
         if (moderationReports) {
            reportsChannel = await interaction.guild.channels
               .create({
                  name: moderationReports,
                  permissionOverwrites,
               })
               .catch(() => undefined);
         }
         if (modRole) {
            await updateCommandPermissions(auxdibot, interaction.guildId, 'punish', [], {
               roles: [modRole.id],
               admin_only: false,
               permission_bypass_roles: [modRole.id],
            }).catch(() => undefined);
            await updateCommandPermissions(auxdibot, interaction.guildId, 'punishment', [], {
               roles: [modRole.id],
               admin_only: false,
               permission_bypass_roles: [modRole.id],
            }).catch(() => undefined);
            await updateCommandPermissions(auxdibot, interaction.guildId, 'user', [], {
               roles: [modRole.id],
               admin_only: false,
               permission_bypass_roles: [modRole.id],
            }).catch(() => undefined);
         }

         const logChannelResult =
            logChannel && (await setLogChannel(auxdibot, interaction.guild, interaction.user, logChannel));
         const reportChannelResult =
            reportsChannel && (await setReportsChannel(auxdibot, interaction.guild, interaction.user, reportsChannel));
         if (modRole) await setReportRole(auxdibot, interaction.guild, interaction.user, modRole);
         const muteRoleResult =
            muteRole && (await setReportsChannel(auxdibot, interaction.guild, interaction.user, muteRole));

         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.author = { name: interaction.user.username, icon_url: interaction.user.avatarURL({ size: 128 }) };
         embed.title = '🔨 Setup Summary';
         embed.description = `\nLog Channel: ${logChannel && logChannelResult ? logChannel : '❌'}\nReports Channel: ${
            reportsChannel && reportChannelResult ? reportsChannel : '❌'
         }\n\nModeration Role: ${modRole ? `✅ ${modRole}` : '❌'}\n\nMute Role: ${
            muteRoleResult ? `✅ ${muteRole}` : '`Discord Timeouts`'
         }\nWarn Threshold: ${
            moderationWarns && warnsResult ? `\`⚠️ ${Number(moderationWarns)} Warns / Mute\`` : '❌'
         }\n\n
            Moderation settings have been configured. Administrators can add exceptions to  Auxdibot's AutoMod feature by running the \`/moderation exceptions add\` command. Administrators can also modify the moderation settings by running the \`/moderation settings\` commands.`;
         return await auxdibot.createReply(interaction, { embeds: [embed] });
      } catch (x) {
         console.error(x);
         handleError(
            auxdibot,
            'MODERATION_SETUP_FAILURE',
            `The moderation setup failed! This may be possible due to several reasons\n\n* An error occurred configuring the command permissions for the created mod role.\n${
               moderationMute
                  ? '* An error occurred assigning permissions for the Mute Role\n* Something went wrong when creating a channel.'
                  : ''
            }\n* An error occurred because of Auxdibot not having permission.\n`,
            interaction,
         );
      }
   },
};
