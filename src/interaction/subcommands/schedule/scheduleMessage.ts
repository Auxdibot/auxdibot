import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';
import { EmbedBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord.js';
import timestampToDuration from '@/util/timestampToDuration';
import { ScheduledMessage } from '@prisma/client';
import Limits from '@/constants/database/Limits';
import createSchedule from '@/modules/features/schedule/createSchedule';

export const scheduleMessage = <AuxdibotSubcommand>{
   name: 'message',
   info: {
      module: Modules['Messages'],
      usageExample: '/schedule message (channel) (interval) (id) [times_to_run] [start_date]',
      description: 'Schedule a message using Auxdibot.',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const channel = interaction.options.getChannel('channel', true, [ChannelType.GuildText]),
         interval = interaction.options.getString('interval', true),
         times_to_run = interaction.options.getNumber('times_to_run'),
         id = interaction.options.getString('id', true),
         start_date = interaction.options.getString('start_date');
      if (
         !(await auxdibot.testLimit(
            interaction.data.guildData.scheduled_messages,
            Limits.SCHEDULE_LIMIT,
            interaction.guild,
         ))
      ) {
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
      if (Number(duration) < 60000) {
         return handleError(
            auxdibot,
            'TOO_SHORT_DURATION',
            'You need to specify a duration longer than one minute!',
            interaction,
         );
      }
      const startDate = new Date(start_date);
      if (!(startDate instanceof Date && !isNaN(startDate.valueOf())) && start_date) {
         return await handleError(auxdibot, 'INVALID_DATE', 'The start date provided is invalid!', interaction);
      }
      const stored = interaction.data.guildData.stored_embeds.find((i) => i.id === id);
      if (!stored) return handleError(auxdibot, 'EMBED_NOT_FOUND', 'Embed not found!', interaction);
      const { content, embed } = stored;
      try {
         const scheduledMessage = <ScheduledMessage>{
            interval_timestamp: interval,
            message: content,
            embed: embed,
            last_run: new Date(
               (startDate instanceof Date && !isNaN(startDate.valueOf()) ? startDate.valueOf() : Date.now()) - duration,
            ),
            times_to_run,
            times_run: 0,
            channelID: channel.id,
         };
         createSchedule(auxdibot, interaction.guild, interaction.user, scheduledMessage, channel).then(async () => {
            const embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
            embed.title = 'Success!';
            embed.description = `Scheduled a message for ${channel}.`;
            return await auxdibot.createReply(interaction, { embeds: [embed] });
         });
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
