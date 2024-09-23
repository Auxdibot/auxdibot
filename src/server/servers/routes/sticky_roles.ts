import { Auxdibot } from '@/Auxdibot';
import addStickyRole from '@/modules/features/roles/sticky_roles/addStickyRole';
import removeStickyRole from '@/modules/features/roles/sticky_roles/removeStickyRole';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { APIRole, Role } from 'discord.js';
import { Router } from 'express';
/*
   Sticky Roles
   Create, view or delete sticky roles.
*/
const stickyRoles = (auxdibot: Auxdibot, router: Router) => {
   router
      .route('/:serverID/sticky_roles')
      .get(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            return auxdibot.database.servers
               .findFirst({ where: { serverID: req.guild.id }, select: { serverID: true, sticky_roles: true } })
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

            addStickyRole(auxdibot, req.guild, role, req.user)
               .then((data) => res.json({ data }))
               .catch((x) => res.status(500).json({ error: x.message }));
         },
      );
   router.route('/:serverID/sticky_roles/:id').delete(
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      async (req, res) => {
         const id = req.params.id;
         if (!id) return res.status(400).json({ error: 'Missing parameter: roleID.' });
         const role: Role | APIRole | undefined = await req.guild.roles.fetch(id).catch(() => undefined);
         if (!role) return res.status(400).json({ error: 'Not a valid role.' });
         return removeStickyRole(auxdibot, req.guild, role, undefined, req.user)
            .then((data) => res.json({ data }))
            .catch((x) =>
               res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' }),
            );
      },
   );
   return router;
};
export default stickyRoles;
