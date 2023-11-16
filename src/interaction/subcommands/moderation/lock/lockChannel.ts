import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/bot/commands/Modules';
import { Channel, ChannelType, EmbedBuilder, PermissionsBitField } from 'discord.js';
import handleError from '@/util/handleError';
import { createLock } from '@/modules/features/moderation/createLock';
import { ChannelLock, Log, LogAction } from '@prisma/client';
import timestampToDuration from '@/util/timestampToDuration';
import handleLog from '@/util/handleLog';

export const lockChannel = <AuxdibotSubcommand>{
   name: 'channel',
   info: {
      module: Modules['Moderation'],
      description: 'Lock a channel. Run /unlock channel to unlock it again.',
      usageExample: '/lock channel [channel] [reason] [duration]',
      permission: 'moderation.lock.channel',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data || !interaction.channel) return;
      const channel: Channel =
         interaction.options.getChannel('channel', false, [
            ChannelType.GuildText,
            ChannelType.GuildAnnouncement,
            ChannelType.GuildForum,
            ChannelType.GuildVoice,
            ChannelType.PublicThread,
            ChannelType.PrivateThread,
            ChannelType.AnnouncementThread,
         ]) || interaction.channel;
      const reason = interaction.options.getString('reason'),
         duration = interaction.options.getString('duration');
      if (channel.isDMBased()) return;
      if (!channel.permissionsFor(interaction.user).has(PermissionsBitField.Flags.ManageChannels)) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = 'You are missing the `Manage Channels` permission on this server!';
         return await interaction.reply({ embeds: [noPermissionEmbed] });
      }
      if (!channel.manageable) {
         return handleError(
            auxdibot,
            'BOT_NO_ACCESS',
            "Auxdibot can't access this channel! Try giving Auxdibot the `Manage Channels` permission.",
            interaction,
         );
      }
      const time = duration ? timestampToDuration(duration) : undefined;
      const lock = <ChannelLock>{
         channelID: channel.id,
         expiration_date: Number(time) ? new Date(Date.now() + Number(time)) : undefined,
         reason: reason,
      };
      const embed = new EmbedBuilder().setColor(auxdibot.colors.punishment).toJSON();
      embed.title = `🔒 Channel Locked`;
      embed.description = `${channel} is now locked.${
         lock.expiration_date ? `\n\r\n🕰️ Expires: <t:${Math.round(lock.expiration_date.valueOf() / 1000)}>` : ''
      }`;
      if (reason) {
         embed.fields = [
            {
               name: 'Channel Lock Reason',
               value: reason,
            },
         ];
      }
      const log = <Log>{
         type: LogAction.CHANNEL_LOCKED,
         userID: interaction.user.id,
         date_unix: Date.now(),
         description: `#${channel.name} was locked. Reason: ${reason || 'No reason specified.'}`,
      };
      if (channel.isThread()) {
         return await channel
            .setLocked(true, reason)
            .then(async () => {
               return await createLock(auxdibot, interaction.data.guildData, lock).then(() => {
                  handleLog(auxdibot, interaction.guild, log);
                  return interaction.reply({ embeds: [embed] });
               });
            })
            .catch(async () => {
               await handleError(auxdibot, 'ERROR_NOT_LOCKABLE', "Auxdibot couldn't lock this channel!", interaction);
            });
      }
      return await channel.permissionOverwrites
         .edit(interaction.guild.roles.everyone, {
            SendMessages: false,
            SendMessagesInThreads: false,
            ...(channel.isVoiceBased()
               ? {
                    Connect: false,
                 }
               : {}),
         })
         .then(async () => {
            return await createLock(auxdibot, interaction.data.guildData, lock).then(() => {
               handleLog(auxdibot, interaction.guild, log);
               interaction.reply({ embeds: [embed] });
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
