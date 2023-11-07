import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import argumentsToEmbedParameters from '@/util/argumentsToEmbedParameters';
import handleError from '@/util/handleError';
import handleLog from '@/util/handleLog';
import timestampToDuration from '@/util/timestampToDuration';
import { toAPIEmbed } from '@/util/toAPIEmbed';
import { EmbedBuilder } from '@discordjs/builders';
import { APIEmbed, LogAction } from '@prisma/client';
import { ChannelType } from 'discord.js';

export const scheduleEdit = <AuxdibotSubcommand>{
   name: 'edit',
   info: {
      module: Modules['Messages'],
      usageExample:
         '/schedule edit (index) [channel] [timestamp] [times_to_run] [content] [color] [title] [title url] [author] [author icon url] [author url] [description] [fields (split title and description with `"|d|"``, and seperate fields with `"|s|"`)] [footer] [footer icon url] [image url] [thumbnail url]',
      description: 'Edit an existing Schedule by Auxdibot.',
      permission: 'schedule.edit',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const index = interaction.options.getNumber('index', true);
      const interval = interaction.options.getString('interval'),
         times_to_run = interaction.options.getNumber('times_to_run'),
         channel = interaction.options.getChannel('channel', false, [
            ChannelType.GuildText,
            ChannelType.GuildAnnouncement,
         ]);
      const parameters = argumentsToEmbedParameters(interaction);
      const server = interaction.data.guildData;

      const schedule = server.scheduled_messages.find((_val, valIndex) => valIndex == index - 1);
      if (!schedule) {
         return await handleError(auxdibot, 'SCHEDULE_NOT_FOUND', "Couldn't find that schedule!", interaction);
      }
      if (Object.keys(parameters).find((i) => !!parameters[i])) schedule.embed = toAPIEmbed(parameters) as APIEmbed;
      if (interval) {
         const duration = timestampToDuration(interval);

         if (!duration || duration == 'permanent') {
            return await handleError(
               auxdibot,
               'INVALID_TIMESTAMP',
               'The timestamp provided is invalid! (Examples of valid timestamps: "1m" for 1 minute, "5d" for 5 days.)',
               interaction,
            );
         }
         schedule.interval_timestamp = interval;
      }
      if (times_to_run) schedule.times_to_run = times_to_run;
      if (channel) schedule.channelID = channel.id;
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { scheduled_messages: server.scheduled_messages },
      });
      await handleLog(auxdibot, interaction.data.guild, {
         userID: interaction.data.member.id,
         description: `Edited scheduled message #${index}.`,
         type: LogAction.SCHEDULED_MESSAGE_EDITED,
         date_unix: Date.now(),
      });
      const success_embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      success_embed.title = 'Success!';
      success_embed.description = `Edited schedule #${index}.`;
      return await interaction.reply({ embeds: [success_embed] });
   },
};
