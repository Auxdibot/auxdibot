import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import { PunishmentType } from '@prisma/client';
import { ChannelType, EmbedBuilder } from 'discord.js';

export const setupAuto = <AuxdibotSubcommand>{
   name: 'auto',
   info: {
      module: Modules['Settings'],
      description: 'Auxdibot will be automatically configured, creating channels & roles for all enabled features.',
      usageExample: '/setup auto',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const server = interaction.data.guildData;

      await interaction.deferReply();

      try {
         const adminCategory = await interaction.guild.channels
            .create({
               type: ChannelType.GuildCategory,
               name: 'Admin',
               permissionOverwrites: [
                  {
                     id: interaction.guild.roles.everyone.id,
                     deny: ['ViewChannel'],
                  },
                  {
                     id: interaction.guild.members.me.id,
                     allow: ['ViewChannel'],
                  },
               ],
            })
            .catch(() => undefined);
         const logChannel = await interaction.guild.channels
            .create({
               name: 'auxdibot-logs',
               parent: adminCategory,
            })
            .catch(() => undefined);
         let suggestionsCategory = undefined,
            suggestionsChannel = undefined,
            suggestionsUpdateChannel = undefined;
         if (!server.disabled_modules.includes('Suggestions')) {
            suggestionsCategory = await interaction.guild.channels
               .create({
                  type: ChannelType.GuildCategory,
                  name: 'Suggestions',
                  permissionOverwrites: [
                     {
                        id: interaction.guild.roles.everyone.id,
                        deny: ['SendMessages'],
                     },
                     {
                        id: interaction.guild.members.me.id,
                        allow: ['SendMessages'],
                     },
                  ],
               })
               .catch(() => undefined);
            suggestionsChannel = await interaction.guild.channels
               .create({
                  name: 'suggestions',
                  parent: suggestionsCategory,
               })
               .catch(() => undefined);
            suggestionsUpdateChannel = await interaction.guild.channels
               .create({
                  name: 'suggestions-updates',
                  parent: suggestionsCategory,
               })
               .catch(() => undefined);
         }
         let starboardChannel = undefined;
         if (!server.disabled_modules.includes('Starboard')) {
            starboardChannel = await interaction.guild.channels
               .create({
                  name: 'starboard',
               })
               .catch(() => undefined);
         }
         let muteRole = undefined;
         let reportsChannel = undefined;
         if (!server.disabled_modules.includes('Moderation')) {
            reportsChannel = await interaction.guild.channels
               .create({
                  name: 'auxdibot-reports',
                  parent: adminCategory,
               })
               .catch(() => undefined);
            muteRole = await interaction.guild.roles.create({
               name: 'Muted',
               color: 'DarkRed',
            });
            interaction.data.guild.channels.cache.forEach((r) => {
               if (r.isDMBased() || r.isThread() || !muteRole) return;
               r.permissionOverwrites.create(muteRole, {
                  SendMessages: false,
                  SendMessagesInThreads: false,
                  AddReactions: false,
               });
               if (r.isVoiceBased())
                  r.permissionOverwrites.create(muteRole, {
                     Connect: false,
                  });
            });
         }
         await auxdibot.database.servers.update({
            where: { serverID: server.serverID },
            data: {
               log_channel: logChannel.id,
               reports_channel: reportsChannel?.id,
               suggestions_channel: suggestionsChannel?.id,
               suggestions_updates_channel: suggestionsUpdateChannel?.id,
               starboard_channel: starboardChannel?.id,
               mute_role: muteRole?.id,
               automod_attachments_limit: { messages: 5, duration: 15000 },
               automod_invites_limit: { messages: 3, duration: 15000 },
               automod_spam_limit: { messages: 15, duration: 15000 },
               automod_punish_threshold_warns: 3,
               automod_threshold_punishment: PunishmentType.MUTE,
               automod_attachments_punishment: { punishment: PunishmentType.WARN },
               automod_invites_punishment: { punishment: PunishmentType.WARN },
               automod_spam_punishment: { punishment: PunishmentType.WARN },
            },
         });
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.author = { name: interaction.user.username, icon_url: interaction.user.avatarURL({ size: 128 }) };
         embed.title = '🔨 Setup Summary';
         embed.description = `Admin Category Created: ${
            adminCategory ? `✅ ${adminCategory}` : '❌'
         }\nLog Channel Created: ${logChannel ? `✅ ${logChannel}` : '❌'}\nReports Channel Created: ${
            reportsChannel ? `✅ ${reportsChannel}` : '❌'
         }\nMute Role Created: ${muteRole ? `✅ ${muteRole}` : '❌'}\n\nSuggestions Category Created: ${
            suggestionsCategory ? `✅ ${suggestionsCategory}` : '❌'
         }\nSuggestions Channel Created: ${
            suggestionsChannel ? `✅ ${suggestionsChannel}` : '❌'
         }\nSuggestions Updates Channel Created: ${
            suggestionsUpdateChannel ? `✅ ${suggestionsUpdateChannel}` : '❌'
         }\n\nStarboard Channel: ${
            starboardChannel ? `✅ ${starboardChannel}` : '❌'
         }\n\nAutomod has been configured with a basic suite of settings for you. You will need to provide blacklisted phrases with \`/moderation blacklist add (phrase)\` and roles exempt to automod with \`/moderation exceptions add (role)\``;
         return await interaction.editReply({ embeds: [embed] });
      } catch (x) {
         handleError(
            auxdibot,
            'SERVER_SETUP_FAILURE',
            'The server setup failed! This may be possible due to several reasons\n\n* A channel with the name of a channel Auxdibot tried to create already exists\n* A role with the name of a role Auxdibot tried to create already exists\n* An error occurred because of Auxdibot not having permission\n',
            interaction,
         );
      }
   },
};
