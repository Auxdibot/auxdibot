import { Auxdibot } from '@/Auxdibot';
import changeAttachmentsLimit from '@/modules/features/moderation/attachments/changeAttachmentsLimit';
import addBlacklistedPhrase from '@/modules/features/moderation/blacklist/addBlacklistedPhrase';
import removeBlacklistedWord from '@/modules/features/moderation/blacklist/removeBlacklistedWord';
import { addAutoModException } from '@/modules/features/moderation/exceptions/addAutoModException';
import { removeAutoModException } from '@/modules/features/moderation/exceptions/removeAutoModException';
import changeInvitesLimit from '@/modules/features/moderation/invites/changeInvitesLimit';
import setReportsChannel from '@/modules/features/moderation/reports/setReportsChannel';
import setReportRole from '@/modules/features/moderation/reports/setReportsRole';
import setMuteRole from '@/modules/features/moderation/setMuteRole';
import setSendModerator from '@/modules/features/moderation/setSendModerator';
import setSendReason from '@/modules/features/moderation/setSendReason';
import changeSpamLimit from '@/modules/features/moderation/spam/changeSpamLimit';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { PunishmentType } from '@prisma/client';
import { Router } from 'express';
import { isNumber } from 'lodash';
/*
   Moderation
   Moderation endpoints for Auxdibot
*/
const moderation = (auxdibot: Auxdibot, router: Router) => {
   router.get(
      '/:serverID/moderation',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return auxdibot.database.servers
            .findFirst({
               where: { serverID: req.guild.id },
               select: {
                  serverID: true,
                  automod_attachments_limit: true,
                  automod_attachments_punishment: true,
                  automod_banned_phrases: true,
                  automod_banned_phrases_punishment: true,
                  automod_invites_limit: true,
                  automod_invites_punishment: true,
                  automod_punish_threshold_warns: true,
                  automod_role_exceptions: true,
                  automod_spam_limit: true,
                  automod_spam_punishment: true,
                  automod_threshold_punishment: true,
                  report_role: true,
                  punishment_send_moderator: true,
                  punishment_send_reason: true,
                  locked_channels: true,
                  mute_role: true,
                  reports_channel: true,
               },
            })
            .then(async (data) =>
               data
                  ? res.json({
                       data,
                    })
                  : res.status(404).json({ error: "couldn't find that server" }),
            )
            .catch(() => {
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );

   router.post(
      '/:serverID/moderation/send_moderator',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return setSendModerator(auxdibot, req.guild, req.user)
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );

   router.post(
      '/:serverID/moderation/send_reason',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return setSendReason(auxdibot, req.guild, req.user)
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );

   router.post(
      '/:serverID/moderation/reports/channel',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const reports_channel = req.body['reports_channel'];
         if (typeof reports_channel != 'string' && typeof reports_channel != 'undefined')
            return res.status(400).json({ error: 'This is not a valid reports channel!' });
         const channel = req.guild.channels.cache.get(reports_channel);
         if (!channel && reports_channel) return res.status(404).json({ error: 'invalid channel' });
         return setReportsChannel(auxdibot, req.guild, req.user, channel)
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );

   router.post(
      '/:serverID/moderation/reports/role',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const new_reports_role = req.body['new_reports_role'];
         const role = req.guild.roles.cache.get(new_reports_role);
         if (!role && new_reports_role) return res.status(404).json({ error: 'invalid role' });
         return setReportRole(auxdibot, req.guild, req.user, role)
            .then((i) => (i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" })))
            .catch(() => {
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );

   router.post(
      '/:serverID/moderation/mute_role',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const new_mute_role = req.body['new_mute_role'];
         const role = req.guild.roles.cache.get(new_mute_role);
         if (!role && new_mute_role) return res.status(404).json({ error: 'invalid role' });
         if (role && req.guild.roles.comparePositions(req.guild.members.me.roles.highest, role.id) <= 0)
            return res.status(500).json({ error: "role higher than auxdibot's highest role" });
         return setMuteRole(auxdibot, req.guild, req.user, role)
            .then((i) => (i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" })))
            .catch(() => {
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );

   router
      .route('/:serverID/moderation/blacklist/')
      .patch(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            const blacklisted_phrase = req.body['blacklisted_phrase'];
            if (typeof blacklisted_phrase != 'string')
               return res.status(400).json({ error: 'This is not a valid blacklisted phrase!' });

            return addBlacklistedPhrase(auxdibot, req.guild, req.user, blacklisted_phrase)
               .then((i) => res.json({ data: i }))
               .catch((x) => {
                  return res.status(500).json({ error: x?.message ?? 'an error occurred' });
               });
         },
      )
      .delete(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            const index = req.body['index'];
            if (!isNumber(Number(index))) return res.status(400).json({ error: 'This is not a valid index!' });
            return removeBlacklistedWord(auxdibot, req.guild, req.user, Number(index))
               .then((data) => res.json({ data }))
               .catch((x) => {
                  return res.status(500).json({ error: x?.message ?? 'an error occurred' });
               });
         },
      );
   router.post(
      '/:serverID/moderation/spam',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const messages = req.body['messages'],
            duration = req.body['duration'];
         if (!isNumber(Number(duration)) || !isNumber(Number(messages)))
            return res.status(400).json({ error: 'This is not a valid spam limit!' });

         return changeSpamLimit(auxdibot, req.guild, req.user, {
            duration: Number(duration),
            messages: Number(messages),
         })
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               return res.status(500).json({ error: x?.message ?? 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/moderation/attachments',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const attachments = req.body['attachments'],
            duration = req.body['duration'];
         if (!isNumber(Number(duration)) || !isNumber(Number(attachments)))
            return res.status(400).json({ error: 'This is not a valid spam limit!' });

         return changeAttachmentsLimit(auxdibot, req.guild, req.user, {
            duration: Number(duration),
            messages: Number(attachments),
         })
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               return res.status(500).json({ error: x?.message ?? 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/moderation/invites',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const invites = req.body['invites'],
            duration = req.body['duration'];
         if (!isNumber(Number(duration)) || !isNumber(Number(invites)))
            return res.status(400).json({ error: 'This is not a valid spam limit!' });

         return changeInvitesLimit(auxdibot, req.guild, req.user, {
            duration: Number(duration),
            messages: Number(invites),
         })
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               return res.status(500).json({ error: x?.message ?? 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/moderation/blacklist/punishment',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const punishment = req.body['punishment'];
         if (typeof punishment != 'string' || !PunishmentType[punishment])
            return res.status(400).json({ error: 'This is not a valid punishment!' });

         return auxdibot.database.servers
            .update({
               where: { serverID: req.guild.id },
               data: {
                  automod_banned_phrases_punishment: PunishmentType[punishment],
               },
               select: { serverID: true, automod_banned_phrases_punishment: true },
            })
            .then((i) => res.json({ data: i }))
            .catch(() => {
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );

   router.post(
      '/:serverID/moderation/spam/punishment',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const punishment = req.body['punishment'],
            reason = req.body['reason'];
         if (reason.length > 500) return res.status(400).json({ error: 'Your reason specified is too long!' });
         return auxdibot.database.servers
            .update({
               where: { serverID: req.guild.id },
               data: {
                  automod_spam_punishment: PunishmentType[punishment]
                     ? { punishment: PunishmentType[punishment], reason: reason || undefined }
                     : undefined,
               },
               select: { serverID: true, automod_spam_punishment: true },
            })
            .then((i) => res.json({ data: i }))
            .catch(() => {
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/moderation/attachments/punishment',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const punishment = req.body['punishment'],
            reason = req.body['reason'];
         if (typeof punishment != 'string' || !PunishmentType[punishment])
            return res.status(400).json({ error: 'This is not a valid punishment!' });
         if (reason.length > 500) return res.status(400).json({ error: 'Your reason specified is too long!' });
         return auxdibot.database.servers
            .update({
               where: { serverID: req.guild.id },
               data: {
                  automod_attachments_punishment: PunishmentType[punishment]
                     ? { punishment: PunishmentType[punishment], reason: reason || undefined }
                     : undefined,
               },
               select: { serverID: true, automod_attachments_punishment: true },
            })
            .then((i) => res.json({ data: i }))
            .catch(() => {
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/moderation/invites/punishment',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const punishment = req.body['punishment'],
            reason = req.body['reason'];
         if (typeof punishment != 'string' || !PunishmentType[punishment])
            return res.status(400).json({ error: 'This is not a valid punishment!' });
         if (reason.length > 500) return res.status(400).json({ error: 'Your reason specified is too long!' });
         return auxdibot.database.servers
            .update({
               where: { serverID: req.guild.id },
               data: {
                  automod_invites_punishment: PunishmentType[punishment]
                     ? { punishment: PunishmentType[punishment], reason: reason || undefined }
                     : undefined,
               },
               select: { serverID: true, automod_invites_punishment: true },
            })
            .then((i) => res.json({ data: i }))
            .catch(() => {
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/moderation/threshold',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const warns = req.body['warns'];
         if (!Number(warns)) return res.status(400).json({ error: 'This is not a valid warns threshold!' });
         const punishment = req.body['punishment'];
         if (typeof punishment != 'string' || !PunishmentType[punishment])
            return res.status(400).json({ error: 'This is not a valid punishment!' });
         return auxdibot.database.servers
            .update({
               where: { serverID: req.guild.id },
               data: {
                  automod_punish_threshold_warns: Number(warns),
                  automod_threshold_punishment: PunishmentType[punishment],
               },
               select: { serverID: true, automod_punish_threshold_warns: true, automod_threshold_punishment: true },
            })
            .then((i) => res.json({ data: i }))
            .catch(() => {
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router
      .route('/:serverID/moderation/exceptions/')
      .patch(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            const roleID = req.body['role'];
            const role = req.guild.roles.cache.get(roleID);
            if (!role && roleID) return res.status(404).json({ error: 'invalid role' });
            return addAutoModException(auxdibot, req.guild, role, req.user.id)
               .then((i) =>
                  i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" }),
               )
               .catch((x) => {
                  return res.status(500).json({ error: x.message ?? 'an error occurred' });
               });
         },
      )
      .delete(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            const index = req.body['index'];
            if (!isNumber(Number(index)) || Number(index) < 0)
               return res.status(400).json({ error: 'This is not a valid index!' });
            return removeAutoModException(auxdibot, req.guild, undefined, Number(index), req.user.id)
               .then((i) =>
                  i ? res.json({ data: i }) : res.status(500).json({ error: "couldn't update that server" }),
               )
               .catch((x) => {
                  return res.status(500).json({ error: x.message ?? 'an error occurred' });
               });
         },
      );

   return router;
};
export default moderation;
