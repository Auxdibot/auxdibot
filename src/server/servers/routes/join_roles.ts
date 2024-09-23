import { Auxdibot } from '@/Auxdibot';
import addJoinRole from '@/modules/features/roles/join_roles/addJoinRole';
import removeJoinRole from '@/modules/features/roles/join_roles/removeJoinRole';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { APIRole, Role } from 'discord.js';
import { Router } from 'express';
/*
   Join Roles
   Create, view or delete join roles.
*/
const joinRoles = (auxdibot: Auxdibot, router: Router) => {
   router
      .route('/:serverID/join_roles')
      .get(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            return auxdibot.database.servers
               .findFirst({ where: { serverID: req.guild.id }, select: { serverID: true, join_roles: true } })
               .then(async (data) =>
                  data
                     ? res.json({
                          data,
                       })
                     : res.status(404).json({ error: "Couldn't find that server." }),
               )
               .catch((x) => {
                  console.error(x);
                  return res.status(500).json({ error: 'An error occurred.' });
               });
         },
      )
      .post(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         async (req, res) => {
            if (!req.body['roleID']) return res.status(400).json({ error: 'Missing parameter: roleID.' });
            const role: Role | APIRole | undefined = await req.guild.roles
               .fetch(req.body['roleID'])
               .catch(() => undefined);
            if (!role) return res.status(400).json({ error: 'Not a valid role.' });

            addJoinRole(auxdibot, req.guild, role, req.user)
               .then((data) => res.json({ data }))
               .catch((x) => res.status(500).json({ error: x.message }));
         },
      );
   router.route('/:serverID/join_roles/:id').delete(
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      async (req, res) => {
         const id = req.params.id;
         if (!id) return res.status(400).json({ error: 'Missing parameter: roleID.' });
         const role: Role | APIRole | undefined = await req.guild.roles.fetch(id).catch(() => undefined);
         if (!role) return res.status(400).json({ error: 'Not a valid role.' });
         return removeJoinRole(auxdibot, req.guild, role, undefined, req.user)
            .then((data) => res.json({ data }))
            .catch((x) =>
               res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' }),
            );
      },
   );
   return router;
};
export default joinRoles;
