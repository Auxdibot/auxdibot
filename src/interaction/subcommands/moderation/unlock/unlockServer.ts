import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/bot/commands/Modules';
import { EmbedBuilder, PermissionsBitField } from 'discord.js';
import { deleteLock } from '@/modules/features/moderation/lock/deleteLock';
import handleLog from '@/util/handleLog';
import { Log, LogAction } from '@prisma/client';
import { testDiscordPermission } from '@/util/testDiscordPermission';

export const unlockServer = <AuxdibotSubcommand>{
   name: 'server',
   info: {
      module: Modules['Moderation'],
      description: 'Unlock the entire server. Run /lock server to lock it again.',
      usageExample: '/unlock server',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data || !interaction.channel) return;
      const server = interaction.data.guildData;

      if (!(await testDiscordPermission(auxdibot, interaction, PermissionsBitField.Flags.ManageChannels))) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = 'You are missing the `Manage Channels` permission on this server!';
         return await auxdibot.createReply(interaction, { embeds: [noPermissionEmbed] });
      }

      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = `🔒 Server Unlocked`;
      embed.description = `Unlocking server...`;
      const log = <Log>{
         type: LogAction.SERVER_UNLOCKED,
         userID: interaction.user.id,
         date: new Date(),
         description: `The server is now unlocked.`,
      };
      handleLog(auxdibot, interaction.guild, log);
      await auxdibot.createReply(interaction, { embeds: [embed] });
      for (const locked of server.locked_channels) {
         const channel = await interaction.guild.channels.fetch(locked.channelID).catch(() => undefined);
         if (!channel) continue;
         if (channel.isThread()) {
            return await channel
               .setLocked(false)
               .then(async () => {
                  return await deleteLock(auxdibot, interaction.data.guildData, channel.id);
               })
               .catch(async () => undefined);
         }
         return await channel.permissionOverwrites
            .edit(interaction.guild.roles.everyone, {
               SendMessages: true,
               SendMessagesInThreads: true,
               ...(channel.isVoiceBased()
                  ? {
                       Connect: true,
                    }
                  : {}),
            })
            .then(async () => {
               return await deleteLock(auxdibot, interaction.data.guildData, channel.id);
            })
            .catch(async () => undefined);
      }
   },
};
