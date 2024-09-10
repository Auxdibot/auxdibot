import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import Modules from '@/constants/bot/commands/Modules';
import { EmbedBuilder, PermissionsBitField } from 'discord.js';
import { createLock } from '@/modules/features/moderation/lock/createLock';
import { ChannelLock, LogAction } from '@prisma/client';
import timestampToDuration from '@/util/timestampToDuration';
import handleLog from '@/util/handleLog';
import handleError from '@/util/handleError';
import { testDiscordPermission } from '@/util/testDiscordPermission';

export const lockServer = <AuxdibotSubcommand>{
   name: 'server',
   info: {
      module: Modules['Moderation'],
      description: 'Lock the entire server. Run /unlock server to unlock it again.',
      usageExample: '/lock server [reason] [duration]',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data || !interaction.channel) return;
      const reason = interaction.options.getString('reason'),
         duration = interaction.options.getString('duration');

      if (!(await testDiscordPermission(auxdibot, interaction, PermissionsBitField.Flags.ManageChannels))) {
         const noPermissionEmbed = new EmbedBuilder().setColor(auxdibot.colors.denied).toJSON();
         noPermissionEmbed.title = '⛔ No Permission!';
         noPermissionEmbed.description = 'You are missing the `Manage Channels` permission on this server!';
         return await auxdibot.createReply(interaction, { embeds: [noPermissionEmbed] });
      }
      const time = duration ? timestampToDuration(duration) : undefined;
      if (Number(time) < 60000) {
         return handleError(
            auxdibot,
            'TOO_SHORT_DURATION',
            'You need to specify a duration longer than one minute!',
            interaction,
         );
      }
      const expiration_date = Number(time) ? new Date(Date.now() + Number(time)) : undefined;
      const embed = new EmbedBuilder().setColor(auxdibot.colors.punishment).toJSON();
      embed.title = `🔒 Server Locked`;
      embed.description = `Currently locking the server...${
         expiration_date ? `\n\r\n🕰️ Expires: <t:${Math.round(expiration_date.valueOf() / 1000)}>` : ''
      }`;
      if (reason) {
         embed.fields = [
            {
               name: 'Server Lock Reason',
               value: reason,
            },
         ];
      }
      handleLog(auxdibot, interaction.guild, {
         type: LogAction.SERVER_LOCKED,
         userID: interaction.user.id,
         date: new Date(),
         description: `The server was locked.`,
      });
      await auxdibot.createReply(interaction, { embeds: [embed] });
      const channels = await interaction.guild.channels.fetch().catch(() => []);
      for (const channel of channels.values()) {
         if (!channel.isDMBased() && channel.isTextBased()) {
            const lock = <ChannelLock>{
               channelID: channel.id,
               expiration_date,
               reason: reason,
            };
            await channel.permissionOverwrites
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
                  return await createLock(auxdibot, interaction.data.guildData, lock);
               })
               .catch(async () => undefined);
         }
      }
   },
};
