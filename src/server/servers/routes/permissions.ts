import { Auxdibot } from '@/interfaces/Auxdibot';
import createPermissionOverride from '@/modules/features/permissions/createPermissionOverride';
import deletePermissionOverride from '@/modules/features/permissions/deletePermissionOverride';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';
import { PermissionOverride } from '@prisma/client';
import { Router } from 'express';
/*
   Permissions
   Create, view or delete permission overrides.
*/
const permissions = (auxdibot: Auxdibot, router: Router) => {
   router
      .route('/:serverID/permissions')
      .get(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res) => {
            return auxdibot.database.servers
               .findFirst({ where: { serverID: req.guild.id }, select: { serverID: true, permission_overrides: true } })
               .then(async (data) =>
                  data
                     ? res.json({
                          data: {
                             permission_overrides: await data.permission_overrides.reduce(
                                async (acc: unknown[] | Promise<unknown[]>, i, index) => {
                                   const arr = await acc;
                                   const user = await req.guild.members
                                         .fetch(i.userID)
                                         .then((member) => member.user)
                                         .catch(() => undefined),
                                      role = req.guild.roles.cache.get(i.roleID);
                                   if (arr.length == 0)
                                      return [
                                         {
                                            ...i,
                                            index,
                                            user,
                                            role,
                                         },
                                      ];

                                   arr.push({
                                      ...i,
                                      index,
                                      user,
                                      role,
                                   });
                                   return arr;
                                },
                                [],
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
            if (!req.body['permission'] || !req.body['allowed'] || (!req.body['user'] && !req.body['role']))
               return res.status(400).json({ error: 'missing parameters' });
            if (req.body['user'] && req.body['role'])
               return res.status(400).json({ error: 'you can only specify a role OR a user' });

            try {
               const allowed = /^true$/i.test(req.body['allowed']),
                  permission = req.body['permission'],
                  role = req.body['role'] ? req.guild.roles.cache.get(req.body['role']) : undefined,
                  user = req.body['user']
                     ? await req.guild.members.fetch(req.body['user']).catch(() => undefined)
                     : undefined;
               if (!user && !role) return res.status(400).json({ error: 'invalid role or user' });
               const permissionOverride = {
                  allowed,
                  userID: user?.id,
                  roleID: role?.id,
                  permission,
               } satisfies PermissionOverride;
               return createPermissionOverride(auxdibot, req.guild, req.user, permissionOverride)
                  .then(() => res.json(permissionOverride))
                  .catch((x) =>
                     res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' }),
                  );
            } catch (x) {
               console.log(x);
               return res.status(500).json({ error: 'an error occurred' });
            }
         },
      );
   router.route('/:serverID/permissions/:id').delete(
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         const id = req.params.id;
         if ((typeof id != 'string' && typeof id != 'number') || Number(id) < -1)
            return res.status(404).json({ error: 'invalid id' });

         return deletePermissionOverride(auxdibot, req.guild, req.user, Number(id))
            .then((i) => res.json({ data: i }))
            .catch((x) =>
               res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' }),
            );
      },
   );
   return router;
};
export default permissions;
