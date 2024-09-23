import { getMessage } from '@/util/getMessage';
import parsePlaceholders from '@/util/parsePlaceholder';
import { Auxdibot } from '@/Auxdibot';
import addReactionRole from '@/modules/features/roles/reaction_roles/addReactionRole';
import removeReactionRole from '@/modules/features/roles/reaction_roles/removeReactionRole';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { APIEmbed, ReactionRoleType } from '@prisma/client';
import { Router } from 'express';
import { applyReactionsToMessages } from '@/modules/features/roles/reaction_roles/applyReactionsToMessage';
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
            if (!req.body['reactions']) return res.status(400).json({ error: 'missing parameters' });
            const title = req.body['title'] || 'React to receive roles!';
            try {
               const reactionsParsed: Array<ReactionRoleRequest> = JSON.parse(
                  req.body['reactions'],
               ) satisfies Array<ReactionRoleRequest>;

               const embed = req.body['embed']
                  ? (JSON.parse(
                       await parsePlaceholders(auxdibot, req.body['embed'], { guild: req.guild }),
                    ) satisfies APIEmbed)
                  : undefined;
               const type = ReactionRoleType[req.body['type'] ?? 'DEFAULT'] ?? ReactionRoleType.DEFAULT;
               if (reactionsParsed.length > 10)
                  return res.status(400).json({ error: 'You have provided too many reactions and roles!' });
               if (req.body['messageID']) {
                  const message = await getMessage(req.guild, req.body['messageID']);
                  if (!message) return res.status(400).json({ error: 'Invalid message ID' });
                  return applyReactionsToMessages(auxdibot, req.guild, message, reactionsParsed, type)
                     .then((i) => res.json({ created: i }))
                     .catch((x) =>
                        res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' }),
                     );
               }
               if (!req.body['channel']) return res.status(400).json({ error: 'missing parameters' });
               const channel = req.guild.channels.cache.get(req.body['channel']);
               const webhook_url = req.body['webhook_url'];
               console.log(embed);
               return addReactionRole(
                  auxdibot,
                  req.guild,
                  channel,
                  title,
                  reactionsParsed,
                  embed ?? undefined,
                  await parsePlaceholders(auxdibot, req.body['message'], { guild: req.guild }),
                  type,
                  webhook_url ?? undefined,
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
            if (!Number.isInteger(Number(index))) return res.status(400).json({ error: 'This is not a valid index!' });
            try {
               return removeReactionRole(auxdibot, req.guild, Number(index), req.user)
                  .then((i) => res.json({ data: i.reaction_roles }))
                  .catch((x) => {
                     console.error(x);
                     return res.status(500).json({ error: x.message ?? 'an error occurred' });
                  });
            } catch (x) {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            }
         },
      );
   return router;
};
export default reactionRoles;
