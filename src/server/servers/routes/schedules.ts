import { Auxdibot } from '@/interfaces/Auxdibot';
import createSchedule from '@/modules/features/schedule/createSchedule';
import deleteSchedule from '@/modules/features/schedule/deleteSchedule';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import parsePlaceholders from '@/util/parsePlaceholder';
import timestampToDuration from '@/util/timestampToDuration';
import { APIEmbed, ScheduledMessage } from '@prisma/client';
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
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            return auxdibot.database.servers
               .findFirst({ where: { serverID: req.guild.id }, select: { serverID: true, scheduled_messages: true } })
               .then(async (data) =>
                  data
                     ? res.json({
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
                                         ? JSON.parse(
                                              await parsePlaceholders(auxdibot, JSON.stringify(i.embed), req.guild),
                                           )
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
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         async (req, res) => {
            if (!req.body['duration'] || !req.body['channel'] || (!req.body['message'] && !req.body['embed']))
               return res.status(400).json({ error: 'missing parameters' });
            try {
               const duration = timestampToDuration(req.body['duration']);
               if (Number(duration) < 60000) {
                  return res.status(400).json({ error: 'The duration specified is less than one minute!' });
               }
               const start_date = req.body['start_date'];
               const startDate = new Date(start_date);
               if (!(startDate instanceof Date && !isNaN(startDate.valueOf())) && start_date)
                  return res.status(400).json({ error: 'invalid start date' });

               const channel = req.guild.channels.cache.get(req.body['channel']);
               const embed = req.body['embed'] ? (JSON.parse(req.body['embed']) satisfies APIEmbed) : undefined;
               if (!duration || duration == 'permanent') return res.status(400).json({ error: 'invalid duration' });
               if (!channel) return res.status(400).json({ error: 'invalid channel' });
               const scheduledMessage = <ScheduledMessage>{
                  interval_timestamp: req.body['duration'],
                  message: req.body['message'],
                  embed: embed,
                  last_run: new Date(
                     (startDate instanceof Date && !isNaN(startDate.valueOf()) ? startDate.valueOf() : Date.now()) -
                        duration,
                  ),
                  times_to_run: req.body['times_to_run'] ? Number(req.body['times_to_run']) : undefined,
                  times_run: 0,
                  channelID: req.body['channel'],
               };
               return createSchedule(auxdibot, req.guild, req.user, scheduledMessage, channel)
                  .then((msg) => res.json({ data: msg }))
                  .catch((x) =>
                     typeof x == 'string'
                        ? res.status(500).json({ error: x })
                        : res.status(500).json({ error: 'an error occurred' }),
                  );
            } catch (x) {
               console.log(x);
               return res.status(500).json({ error: 'an error occurred' });
            }
         },
      );
   router.route('/:serverID/schedules/:id').delete(
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const id = req.params.id;
         if ((typeof id != 'string' && typeof id != 'number') || Number(id) < -1)
            return res.status(404).json({ error: 'invalid id' });
         return deleteSchedule(auxdibot, req.guild, req.user, Number(id))
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   return router;
};
export default schedules;
