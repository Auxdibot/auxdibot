import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { GuildAuxdibotCommandData } from '@/interfaces/commands/AuxdibotCommandData';
import AuxdibotCommandInteraction from '@/interfaces/commands/AuxdibotCommandInteraction';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';

import { EmbedBuilder } from '@discordjs/builders';
import { LogAction } from '@prisma/client';

export const scheduleRemove = <AuxdibotSubcommand>{
   name: 'remove',
   info: {
      module: Modules['Messages'],
      description: 'Remove a schedule from your server. It will never run again after deletion.',
      usageExample: '/schedule remove (index)',
   },
   async execute(auxdibot: Auxdibot, interaction: AuxdibotCommandInteraction<GuildAuxdibotCommandData>) {
      if (!interaction.data) return;
      const index = interaction.options.getNumber('index', true);
      const server = interaction.data.guildData;

      const schedule = server.scheduled_messages.find((_val, valIndex) => valIndex == index - 1);
      if (!schedule) {
         return await handleError(auxdibot, 'SCHEDULE_NOT_FOUND', "Couldn't find that schedule!", interaction);
      }
      const channel = schedule.channelID ? interaction.data.guild.channels.cache.get(schedule.channelID) : undefined;
      server.scheduled_messages.splice(server.scheduled_messages.indexOf(schedule), 1);
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { scheduled_messages: server.scheduled_messages },
      });
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      successEmbed.title = '⏲️ Deleted Scheduled Message';
      successEmbed.description = `Deleted a scheduled message ${channel ? `in ${channel}` : ''}.`;
      await auxdibot.log(interaction.data.guild, {
         userID: interaction.data.member.id,
         description: `Deleted scheduled message #${index}.`,
         type: LogAction.SCHEDULED_MESSAGE_REMOVED,
         date: new Date(),
      });
      return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
   },
};
