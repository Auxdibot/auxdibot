import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import createReminder from '@/modules/features/reminders/createReminder';
import handleError from '@/util/handleError';
import timestampToDuration from '@/util/timestampToDuration';
import timestampToTimeString from '@/util/timestampToTimeString';
import { EmbedBuilder } from '@discordjs/builders';

export default <AuxdibotSubcommand>{
   name: 'repeat',
   info: {
      module: Modules['User'],
      description: 'Create a reminder that will remind you repetitively.',
      usageExample: '/remind repeat (interval) (reminder) [start_date] [times_to_repeat]',
   },
   async execute(auxdibot, interaction) {
      const start_date = interaction.options.getString('start_date'),
         reminder = interaction.options.getString('reminder'),
         interval = interaction.options.getString('interval'),
         times_to_run = interaction.options.getInteger('times_to_repeat', false);

      await interaction.deferReply({ ephemeral: true });
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
      const startDate = start_date ? new Date(start_date) : undefined;
      if (!(startDate instanceof Date && !isNaN(startDate.valueOf())) && start_date) {
         return await handleError(auxdibot, 'INVALID_DATE', 'The start date provided is invalid!', interaction);
      }
      return createReminder(auxdibot, interaction.user, {
         date_to_run: startDate,
         message: reminder,
         last_run: new Date(),
         times_to_run,
         interval_timestamp: interval,
         embed: null,
         times_run: 0,
      }).then(() => {
         const success = new EmbedBuilder()
            .setTitle('⏰ Reminder Created')
            .setDescription(
               `I will remind you every ${timestampToTimeString(interval)}${
                  startDate ? ` starting at <t:${Math.round(startDate.valueOf() / 1000)}>` : ''
               } with the message: \n\`\`\`${reminder}\`\`\``,
            )
            .setColor(auxdibot.colors.accept);
         return auxdibot.createReply(interaction, { ephemeral: true, embeds: [success.toJSON()] });
      });
   },
};
