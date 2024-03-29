import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/bot/commands/Modules';
import { Channel, ChannelType, EmbedBuilder, PermissionsBitField } from 'discord.js';
import handleError from '@/util/handleError';
import { deleteLock } from '@/modules/features/moderation/lock/deleteLock';
import handleLog from '@/util/handleLog';
import { Log, LogAction } from '@prisma/client';
import testDiscordPermission from '@/util/testDiscordPermission';

export const unlockChannel = <AuxdibotSubcommand>{
   name: 'channel',
   info: {
      module: Modules['Moderation'],
      description: 'Lock a channel. Run /lock channel to lock it again.',
      usageExample: '/unlock channel [channel]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data || !interaction.channel) return;
      const server = interaction.data.guildData;
      const channel: Channel =
         interaction.options.getChannel('channel', false, [
            ChannelType.GuildText,
            ChannelType.GuildAnnouncement,
            ChannelType.GuildForum,
            ChannelType.GuildVoice,
         ]) || interaction.channel;
      if (channel.isDMBased()) return;
      if (!(await testDiscordPermission(auxdibot, interaction, PermissionsBitField.Flags.ManageChannels))) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = 'You are missing the `Manage Channels` permission on this server!';
         return await auxdibot.createReply(interaction, { embeds: [noPermissionEmbed] });
      }
      if (!channel.manageable) {
         return handleError(
            auxdibot,
            'BOT_NO_ACCESS',
            "Auxdibot can't access this channel! Try giving Auxdibot the `Manage Channels` permission.",
            interaction,
         );
      }
      if (!server.locked_channels.find((i) => i.channelID == channel.id)) {
         return handleError(auxdibot, 'CHANNEL_NOT_LOCKED', 'This channel is currently not locked!', interaction);
      }
      const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      embed.title = `🔒 Channel Unlocked`;
      embed.description = `${channel} is now unlocked.`;
      const log = <Log>{
         type: LogAction.CHANNEL_UNLOCKED,
         userID: interaction.user.id,
         date_unix: Date.now(),
         description: `#${channel.name} was unlocked.`,
      };
      if (channel.isThread()) {
         return await channel
            .setLocked(false)
            .then(async () => {
               return await deleteLock(auxdibot, interaction.data.guildData, channel.id).then(() => {
                  handleLog(auxdibot, interaction.guild, log);
                  auxdibot.createReply(interaction, { embeds: [embed] });
               });
            })
            .catch(async () => {
               await handleError(
                  auxdibot,
                  'ERROR_NOT_UNLOCKABLE',
                  "Auxdibot couldn't unlock this channel!",
                  interaction,
               );
            });
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
            return await deleteLock(auxdibot, interaction.data.guildData, channel.id).then(() => {
               handleLog(auxdibot, interaction.guild, log);
               auxdibot.createReply(interaction, { embeds: [embed] });
            });
         })
         .catch(async () => {
            await handleError(
               auxdibot,
               'ERROR_NOT_LOCKABLE',
               "Auxdibot couldn't lock this channel! Check your permissions.",
               interaction,
            );
         });
   },
};
