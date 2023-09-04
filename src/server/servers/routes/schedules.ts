import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import handleLog from '@/util/handleLog';
import parsePlaceholders from '@/util/parsePlaceholder';
import { testLimit } from '@/util/testLimit';
import timestampToDuration from '@/util/timestampToDuration';
import { APIEmbed, LogAction, ScheduledMessage } from '@prisma/client';
import { Router } from 'express';
/*
   Schedules
   Create, view or delete schedules.
*/
const schedules = (auxdibot: Auxdibot, router: Router) => {
   router
      .route('/:serverID/schedules')
      .get(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res) => {
            if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
            const serverID = req.params.serverID;
            const guildData = req.user.guilds.find((i) => i.id == serverID);
            const guild = auxdibot.guilds.cache.get(guildData.id);
            if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });

            return auxdibot.database.servers
               .findFirst({ where: { serverID: serverID }, select: { serverID: true, scheduled_messages: true } })
               .then(async (data) =>
                  data
                     ? res.json({
                          ...guildData,
                          data: {
                             scheduled_messages: await data.scheduled_messages.reduce(
                                async (
                                   acc:
                                      | Promise<(ScheduledMessage & { index: number })[]>
                                      | (ScheduledMessage & { index: number })[],
                                   i,
                                   index,
                                ) => {
                                   const arr = await acc;
                                   arr.push({
                                      ...i,
                                      embed: i.embed
                                         ? JSON.parse(await parsePlaceholders(auxdibot, JSON.stringify(i.embed), guild))
                                         : undefined,
                                      index,
                                   });
                                   return arr;
                                },
                                [] as (ScheduledMessage & { index: number })[],
                             ),
                          },
                       })
                     : res.status(404).json({ error: "couldn't find that server" }),
               )
               .catch((x) => {
                  console.error(x);
                  return res.status(500).json({ error: 'an error occurred' });
               });
         },
      )
      .post(
         (req, res, next) => checkAuthenticated(req, res, next),
         async (req, res) => {
            if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
            if (!req.body['duration'] || !req.body['channel'] || (!req.body['message'] && !req.body['embed']))
               return res.status(400).json({ error: 'missing parameters' });
            const serverID = req.params.serverID;
            const guildData = req.user.guilds.find((i) => i.id == serverID);
            const guild = auxdibot.guilds.cache.get(guildData.id);
            if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });

            try {
               const duration = timestampToDuration(req.body['duration']);
               const channel = guild.channels.cache.get(req.body['channel']);
               const embed = req.body['embed'] ? (JSON.parse(req.body['embed']) satisfies APIEmbed) : undefined;
               if (!duration || duration == 'permanent') return res.status(400).json({ error: 'invalid duration' });
               if (!channel) return res.status(400).json({ error: 'invalid channel' });
               return auxdibot.database.servers
                  .findFirst({ where: { serverID: serverID }, select: { serverID: true, scheduled_messages: true } })
                  .then(async (data) => {
                     if (!testLimit(data.scheduled_messages, Limits.SCHEDULE_LIMIT)) {
                        return res.status(400).json({ error: 'schedules limit exceeded, remove some first' });
                     }
                     const scheduledMessage = {
                        interval_unix: duration,
                        message: req.body['message'],
                        embed: embed,
                        last_run_unix: Date.now() - duration,
                        times_to_run: req.body['times_to_run'] ? Number(req.body['times_to_run']) : undefined,
                        times_run: 0,
                        channelID: req.body['channel'],
                     } satisfies ScheduledMessage;
                     await auxdibot.database.servers.update({
                        where: { serverID: guildData.id },
                        data: { scheduled_messages: { push: scheduledMessage } },
                     });
                     await handleLog(auxdibot, guild, {
                        userID: req.user.id,
                        description: `Scheduled a message for ${channel.name}.`,
                        type: LogAction.SCHEDULED_MESSAGE_CREATED,
                        date_unix: Date.now(),
                     });
                     return res.json(scheduledMessage);
                  });
            } catch (x) {
               console.log(x);
               return res.status(500).json({ error: 'an error occurred' });
            }
         },
      );
   router.route('/:serverID/schedules/:id').delete(
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res) => {
         if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
         const serverID = req.params.serverID,
            id = req.params.id;
         if ((typeof id != 'string' && typeof id != 'number') || Number(id) < -1)
            return res.status(404).json({ error: 'invalid id' });
         const guildData = req.user.guilds.find((i) => i.id == serverID);
         const guild = auxdibot.guilds.cache.get(guildData.id);
         if (!guildData) return res.status(404).json({ error: "couldn't find that server" });
         if (!guildData.owner && !(guildData.permissions & 0x8))
            return res.status(403).json({ error: 'you are not authorized to edit that server' });

         return auxdibot.database.servers
            .findFirst({ where: { serverID: serverID }, select: { scheduled_messages: true } })
            .then(async (data) => {
               if (!data) return res.status(404).json({ error: "couldn't find that server" });
               if (data.scheduled_messages.length < Number(id))
                  return res.status(400).json({ error: 'invalid id provided' });
               const schedule = data.scheduled_messages[Number(id)];
               data.scheduled_messages.splice(Number(id), 1);
               await handleLog(auxdibot, guild, {
                  userID: req.user.id,
                  description: `Deleted scheduled message #${Number(id) + 1}.`,
                  type: LogAction.SCHEDULED_MESSAGE_REMOVED,
                  date_unix: Date.now(),
               });
               return await auxdibot.database.servers
                  .update({
                     where: { serverID: serverID },
                     data: { scheduled_messages: data.scheduled_messages },
                  })
                  .then(() => res.json(schedule));
            })
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   return router;
};
export default schedules;
