import Modules from '@/constants/bot/commands/Modules';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import createReminder from '@/modules/features/reminders/createReminder';
import timestampToDuration from '@/util/timestampToDuration';
import { EmbedBuilder } from '@discordjs/builders';

export default <AuxdibotSubcommand>{
   name: 'once',
   info: {
      module: Modules['User'],
      description: 'Create a reminder that will remind you once.',
      usageExample: '/remind once (date) (reminder)',
   },
   async execute(auxdibot, interaction) {
      const time_to_run = interaction.options.getString('date'),
         reminder = interaction.options.getString('reminder');

      await interaction.deferReply({ ephemeral: true });
      const timestamp = timestampToDuration(time_to_run);
      const date = timestamp != 'permanent' && timestamp ? new Date(Date.now() + timestamp) : new Date(time_to_run);

      return createReminder(auxdibot, interaction.user, {
         date_to_run: date,
         message: reminder,
         last_run: new Date(date instanceof Date && !isNaN(date.valueOf()) ? date.valueOf() : Date.now()),
         times_to_run: 1,
         interval_timestamp: '0m',
         embed: null,
         times_run: 0,
      }).then(() => {
         const success = new EmbedBuilder()
            .setTitle('⏰ Reminder Created')
            .setDescription(
               `I will remind you on <t:${Math.round(
                  date.valueOf() / 1000,
               )}> with the message: \n\`\`\`${reminder}\`\`\``,
            )
            .setColor(auxdibot.colors.accept);
         return auxdibot.createReply(interaction, { ephemeral: true, embeds: [success.toJSON()] });
      });
   },
};
