import { Auxdibot } from '@/Auxdibot';

/**
 * Migrate data based off a flag in the environment variables, "MIGRATION"
 *
 * @param auxdibot - The instance of the Auxdibot.
 */
export async function migrateData(auxdibot: Auxdibot) {
   try {
      if (process.env.MIGRATION == 'times') {
         console.log('-> Attempting to migrate data (times)...');
         const all = await auxdibot.database.servers.findMany();
         if (!all) return;
         for (const i of all) {
            await auxdibot.database.servers.update({
               where: { serverID: i.serverID },
               data: {
                  logs: i.logs.map((i) => ({ ...i, date: i.date ?? new Date(i.old_date_unix ?? Date.now()) })),
                  punishments: i.punishments.map((i) => ({
                     ...i,
                     date: i.date ?? new Date(i.old_date_unix ?? Date.now()),
                     expires_date:
                        i.expires_date ?? i.old_expires_date_unix ? new Date(i.old_expires_date_unix) : undefined,
                  })),
                  suggestions: i.suggestions.map((i) => ({
                     ...i,
                     date: i.date ?? new Date(i.old_date_unix ?? Date.now()),
                  })),
               },
            });
         }
      }
   } catch (x) {
      console.error('-> ERROR MIGRATING DATA');
      console.error(x);
   }
}
