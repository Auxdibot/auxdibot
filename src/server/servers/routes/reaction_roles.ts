import { Auxdibot } from '@/interfaces/Auxdibot';
import addReactionRole from '@/modules/features/reaction_roles/addReactionRole';
import removeReactionRole from '@/modules/features/reaction_roles/removeReactionRole';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { APIEmbed, ReactionRole, ReactionRoleType } from '@prisma/client';
import { Router } from 'express';
/*
   Reaction Roles
   Reaction role endpoints.
*/
type ReactionRoleRequest = { emoji: string; roleID: string };
const reactionRoles = (auxdibot: Auxdibot, router: Router) => {
   router
      .route('/:serverID/reaction_roles')
      .get(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            return auxdibot.database.servers
               .findFirst({
                  where: { serverID: req.guild.id },
                  select: {
                     serverID: true,
                     reaction_roles: true,
                  },
               })
               .then(async (data) =>
                  data
                     ? res.json({
                          data,
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
            if (!req.body['reactions'] || !req.body['channel'])
               return res.status(400).json({ error: 'missing parameters' });
            const title = req.body['title'] || 'React to receive roles!';
            try {
               const reactionsParsed: Array<ReactionRoleRequest> = JSON.parse(
                  req.body['reactions'],
               ) satisfies Array<ReactionRoleRequest>;
               const channel = req.guild.channels.cache.get(req.body['channel']);
               const embed = req.body['embed'] ? (JSON.parse(req.body['embed']) satisfies APIEmbed) : undefined;
               const type = ReactionRoleType[req.body['type'] ?? 'DEFAULT'] ?? ReactionRoleType.DEFAULT;
               return addReactionRole(
                  auxdibot,
                  req.guild,
                  channel,
                  title,
                  reactionsParsed,
                  embed,
                  req.body['message'],
                  type,
               )
                  .then((i) => res.json({ created: i }))
                  .catch((x) =>
                     res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' }),
                  );
            } catch (x) {
               console.log(x);
               return res.status(500).json({ error: 'an error occurred' });
            }
         },
      )
      .delete(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            const index = req.body['index'];
            if (typeof index != 'number' && typeof index != 'string')
               return res.status(400).json({ error: 'This is not a valid index!' });
            return removeReactionRole(auxdibot, req.guild, Number(index), req.user)
               .then((i) => res.json({ data: i.reaction_roles }))
               .catch((x) => {
                  console.error(x);
                  return res.status(500).json({ error: 'an error occurred' });
               });
         },
      );
   return router;
};
export default reactionRoles;
