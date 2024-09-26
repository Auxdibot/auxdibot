import timestampToDuration from '@/util/timestampToDuration';
import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import { EmbedBuilder } from '@discordjs/builders';

export const remindList = <AuxdibotSubcommand>{
   name: 'list',
   info: {
      module: Modules['User'],
      description: 'List the reminders that you have set.',
      usageExample: '/remind list',
   },
   async execute(auxdibot: Auxdibot, interaction) {
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
      const user = await auxdibot.database.users.upsert({
         where: { userID: interaction.user.id },
         create: { userID: interaction.user.id },
         update: {},
         select: { userID: true, reminders: true },
      });
      successEmbed.title = '⏰ Your Reminders';
      successEmbed.description = user.reminders.reduce(
         (accumulator: string, value, index) =>
            `${accumulator}\r\n\r\n**${index + 1})**\`${value.interval_timestamp}\` (next run <t:${Math.round(
               ((value.last_run?.valueOf() ?? Date.now()) +
                  (Number(timestampToDuration(value.interval_timestamp)) || 0)) /
                  1000,
            )}:R>)\n\`${value.message}\``,
         '',
      );
      return await auxdibot.createReply(interaction, { ephemeral: true, embeds: [successEmbed] });
   },
};
