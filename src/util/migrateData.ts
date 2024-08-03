import { defaultStarLevels } from '@/constants/database/defaultStarLevels';
import { DEFAULT_LEVELUP_EMBED } from '@/constants/embeds/DefaultEmbeds';
import { Auxdibot } from '@/interfaces/Auxdibot';
import { isEmbedEmpty } from './isEmbedEmpty';

/**
 * Migrate data based off a flag in the environment variables, "MIGRATION"
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
      if (process.env.MIGRATION == 'levels') {
         console.log('-> Attempting to migrate data (levels)...');
         const all = await auxdibot.database.servers.findMany();
         if (!all) return;
         for (const i of all) {
            if (i.message_xp_range?.length == 0) {
               if (i.old_message_xp) {
                  await auxdibot.database.servers.update({
                     where: { serverID: i.serverID },
                     data: {
                        message_xp_range: [i.old_message_xp],
                        old_message_xp: null,
                     },
                  });
               }
               if (!i.level_message) {
                  console.log('-> ' + i.serverID + ' - does not have level message');
                  await auxdibot.database.servers
                     .update({
                        where: { serverID: i.serverID },
                        data: {
                           level_message: {
                              content: i.level_message?.content ? i.level_message?.content : '',
                              embed:
                                 i.level_message?.embed || !isEmbedEmpty(i.level_message?.embed)
                                    ? i.level_message?.embed
                                    : DEFAULT_LEVELUP_EMBED,
                           },
                        },
                     })
                     .then(() => {
                        console.log('-> Successfully updated level message for ' + i.serverID);
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
