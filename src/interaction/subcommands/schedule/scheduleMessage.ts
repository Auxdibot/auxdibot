import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { toAPIEmbed } from '@/util/toAPIEmbed';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord.js';
import timestampToDuration from '@/util/timestampToDuration';
import { LogAction, ScheduledMessage } from '@prisma/client';
import handleLog from '@/util/handleLog';
import Limits from '@/constants/database/Limits';

export const scheduleMessage = <AuxdibotSubcommand>{
   name: 'message',
   info: {
      module: Modules['Messages'],
      usageExample:
         '/schedule message (channel) (interval) [times to run] [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with `"|d|"``, and seperate fields with `"|s|"`)] [footer] [footer icon url] [image url] [thumbnail url]',
      description: 'Schedule a message using Auxdibot.',
      permission: 'schedule.message',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]),
         interval = interaction.options.getString('interval', true),
         times_to_run = interaction.options.getNumber('times_to_run');
      if (interaction.data.guildData.scheduled_messages.length >= Limits.SCHEDULE_LIMIT) {
         return await handleError(
            auxdibot,
            'SCHEDULE_LIMIT_REACHED',
            'You have too many schedules on this server! Remove some and try again!',
            interaction,
         );
      }
      const duration = timestampToDuration(interval);

      if (!duration || duration == 'permanent') {
         return await handleError(
            auxdibot,
            'INVALID_TIMESTAMP',
            'The timestamp provided is invalid! (Examples of valid timestamps: "1m" for 1 minute, "5d" for 5 days.)',
            interaction,
         );
      }

      const content = interaction.options.getString('content')?.replace(/\\n/g, '\n') || '';
      const parameters = argumentsToEmbedParameters(interaction);
      try {
         const scheduledMessage = <ScheduledMessage>{
            interval_unix: duration,
            message: content,
            embed: toAPIEmbed(parameters),
            last_run_unix: Date.now(),
            times_to_run,
            times_run: 0,
            channelID: channel.id,
         };
         await auxdibot.database.servers.update({
            where: { serverID: interaction.data.guildData.serverID },
            data: { scheduled_messages: { push: scheduledMessage } },
         });
         await handleLog(auxdibot, interaction.data.guild, {
            userID: interaction.data.member.id,
            description: `Scheduled a message for ${channel}, 
            which will run ${new Date(Date.now() + duration).toISOString()}`,
            type: LogAction.SCHEDULED_MESSAGE_CREATED,
            date_unix: Date.now(),
         });
         const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
         embed.title = 'Success!';
         embed.description = `Scheduled a message for ${channel}, 
         which will run <t:${Math.round((Date.now() + duration) / 1000)}:R>`;
         return await interaction.reply({ embeds: [embed] });
      } catch (x) {
         console.log(x);
         return await handleError(
            auxdibot,
            'ERROR_CREATE_SCHEDULE',
            'There was an error creating that schedule!',
            interaction,
         );
      }
   },
};
