import Modules from '@/constants/bot/commands/Modules';
import { Auxdibot } from '@/Auxdibot';
import { AuxdibotSubcommand } from '@/interfaces/commands/AuxdibotSubcommand';
import handleError from '@/util/handleError';

import { EmbedBuilder } from '@discordjs/builders';

export const remindRemove = <AuxdibotSubcommand>{
   name: 'remove',
   info: {
      module: Modules['User'],
      description: 'Remove a reminder. It will never remind you again after deletion.',
      usageExample: '/remind remove (index)',
   },
   async execute(auxdibot: Auxdibot, interaction) {
      const index = interaction.options.getInteger('index', true);
      const user = await auxdibot.database.users
         .upsert({
            where: { userID: interaction.user.id },
            create: { userID: interaction.user.id },
            update: {},
            select: { userID: true, reminders: true },
         })
         .catch(() => undefined);
      if (!user) {
         return await handleError(
            auxdibot,
            'SERVER_ERROR',
            'An error occurred while trying to perform that action. Try again later!',
            interaction,
         );
      }

      const reminder = user.reminders.find((_val, valIndex) => valIndex == index - 1);
      if (!reminder) {
         return await handleError(auxdibot, 'REMINDER_NOT_FOUND', "Couldn't find that reminder!", interaction);
      }
      user.reminders.splice(user.reminders.indexOf(reminder), 1);
      await auxdibot.database.users.update({
         where: { userID: user.userID },
         data: { reminders: user.reminders },
      });
      const successEmbed = new EmbedBuilder().setColor(auxdibot.colors.accept).toJSON();
      successEmbed.title = '⏰ Deleted Reminder';
      successEmbed.description = `Deleted the reminder \`#${index}\`. It will never remind you again.`;
      return await auxdibot.createReply(interaction, { embeds: [successEmbed] });
   },
};
