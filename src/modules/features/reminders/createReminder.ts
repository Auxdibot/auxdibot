import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/Auxdibot';

import { Reminder } from '@prisma/client';

export default async function createReminder(
   auxdibot: Auxdibot,
   user: { id: string; username: string },
   reminder: Reminder,
) {
   if (reminder.message.length > 2000) {
      throw new Error('reminder too long');
   }
   if (reminder.message.length < 1) {
      throw new Error('reminder too short');
   }
   if (reminder.date_to_run && reminder.date_to_run.valueOf() < Date.now()) {
      throw new Error('reminder in the past');
   }
   if (reminder.date_to_run && isNaN(reminder.date_to_run.valueOf())) {
      throw new Error('invalid date');
   }
   return auxdibot.database.users
      .upsert({
         where: { userID: user.id },
         create: { userID: user.id },
         update: {},
         select: { userID: true, reminders: true },
      })
      .then(async (data) => {
         if (!(await auxdibot.testLimit(data.reminders, Limits.USER_REMINDER_LIMIT, user.id))) {
            throw new Error('reminders limit exceeded');
         }
         await auxdibot.database.users.update({
            where: { userID: user.id },
            data: { reminders: { push: reminder } },
         });
         return reminder;
      });
}
