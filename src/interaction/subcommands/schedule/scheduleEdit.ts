import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';

import timestampToDuration from '@/util/timestampToDuration';
import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';
import { ChannelType } from 'discord.js';

export const scheduleEdit = <AuxdibotSubcommand>{
   name: 'edit',
   info: {
      module: Modules['Messages'],
      usageExample: '/schedule edit (index) [channel] [id] [timestamp] [times_to_run]',
      description: 'Edit an existing Schedule by Auxdibot.',
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
      const id = interaction.options.getString('id');
      const server = interaction.data.guildData;

      const schedule = server.scheduled_messages.find((_val, valIndex) => valIndex == index - 1);
      if (!schedule) {
         return await handleError(auxdibot, 'SCHEDULE_NOT_FOUND', "Couldn't find that schedule!", interaction);
      }
      if (id) {
         const stored = interaction.data.guildData.stored_embeds.find((i) => i.id === id);
         if (!stored) return handleError(auxdibot, 'EMBED_NOT_FOUND', 'Embed not found!', interaction);
         const { content, embed } = stored;
         schedule.embed = embed;
         schedule.message = content;
      }
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
         if (Number(duration) < 60000) {
            return handleError(
               auxdibot,
               'TOO_SHORT_DURATION',
               'You need to specify a duration longer than one minute!',
               interaction,
            );
         }
         schedule.interval_timestamp = interval;
      }
      if (times_to_run) schedule.times_to_run = times_to_run;
      if (times_to_run === 0) schedule.times_to_run = undefined;
      if (channel) schedule.channelID = channel.id;
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { scheduled_messages: server.scheduled_messages },
      });
      await auxdibot.log(interaction.data.guild, {
         userID: interaction.data.member.id,
         description: `Edited scheduled message #${index}.`,
         type: LogAction.SCHEDULED_MESSAGE_EDITED,
         date: new Date(),
      });
      const success_embed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      success_embed.title = 'Success!';
      success_embed.description = `Edited schedule #${index}.`;
      return await auxdibot.createReply(interaction, { embeds: [success_embed] });
   },
};
