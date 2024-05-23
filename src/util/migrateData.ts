import { defaultStarLevels } from '@/constants/database/defaultStarLevels';
import { Auxdibot } from '@/interfaces/Auxdibot';

/**
 * Migrate data. Currently being used for old Starboard data.
 *
 * @param auxdibot - The instance of the Auxdibot.
 */
export async function migrateData(auxdibot: Auxdibot) {
   try {
      if (process.env.MIGRATION == 'starboard') {
         console.log('-> Attempting to migrate data (starboard)...');
         const all = await auxdibot.database.servers.findMany();
         if (!all) return;
         for (const i of all) {
            if (i.starboard_boards.length == 0) {
               if (i.old_starboard_channel && i.old_starboard_reaction && i.old_starboard_reaction_count) {
                  await auxdibot.database.servers.update({
                     where: { serverID: i.serverID },
                     data: {
                        starboard_boards: {
                           set: [
                              {
                                 board_name: 'starboard',
                                 channelID: i.old_starboard_channel,
                                 reaction: i.old_starboard_reaction,
                                 count: i.old_starboard_reaction_count,
                                 star_levels: i.old_starboard_reaction == '⭐' ? defaultStarLevels : [],
                              },
                           ],
                        },
                        old_starboard_channel: null,
                        old_starboard_reaction: null,
                        old_starboard_reaction_count: null,
                     },
                  });
               }
            }
         }
      }
   } catch (x) {
      console.error('-> ERROR MIGRATING DATA');
      console.error(x);
   }
}
