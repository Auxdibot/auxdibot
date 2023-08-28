import Limits from '@/constants/database/Limits';
import { Auxdibot } from '@/interfaces/Auxdibot';
import checkAuthenticated from '@/server/checkAuthenticated';
import handleLog from '@/util/handleLog';
import { LogAction, PermissionOverride } from '@prisma/client';
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
         (req, res) => {
            if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
            const serverID = req.params.serverID;
            const guildData = req.user.guilds.find((i) => i.id == serverID);
            const guild = auxdibot.guilds.cache.get(guildData.id);
            if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });

            return auxdibot.database.servers
               .findFirst({ where: { serverID: serverID }, select: { serverID: true, permission_overrides: true } })
               .then(async (data) =>
                  data
                     ? res.json({
                          ...guildData,
                          data: {
                             permission_overrides: await data.permission_overrides.reduce(
                                async (acc: unknown[] | Promise<unknown[]>, i, index) => {
                                   const arr = await acc;
                                   const user = await guild.members
                                         .fetch(i.userID)
                                         .then((member) => member.user)
                                         .catch(() => undefined),
                                      role = guild.roles.cache.get(i.roleID);
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
         async (req, res) => {
            if (!req.user?.guilds) return res.status(400).json({ error: 'no servers' });
            if (!req.body['permission'] || !req.body['allowed'] || (!req.body['user'] && !req.body['role']))
               return res.status(400).json({ error: 'missing parameters' });
            if (req.body['user'] && req.body['role'])
               return res.status(400).json({ error: 'you can only specify a role OR a user' });
            const serverID = req.params.serverID;
            const guildData = req.user.guilds.find((i) => i.id == serverID);
            const guild = auxdibot.guilds.cache.get(guildData.id);
            if (!guildData || !guild) return res.status(404).json({ error: "couldn't find that server" });
            if (!guildData.owner && !(guildData.permissions & 0x8))
               return res.status(403).json({ error: 'you are not authorized to edit that server' });

            try {
               const allowed = /^true$/i.test(req.body['allowed']),
                  permission = req.body['permission'],
                  role = req.body['role'] ? guild.roles.cache.get(req.body['role']) : undefined,
                  user = req.body['user']
                     ? await guild.members.fetch(req.body['user']).catch(() => undefined)
                     : undefined;
               if (!user && !role) return res.status(400).json({ error: 'invalid role or user' });
               return auxdibot.database.servers
                  .findFirst({ where: { serverID: serverID }, select: { serverID: true, permission_overrides: true } })
                  .then(async (data) => {
                     if (data.permission_overrides.length >= Limits.PERMISSION_OVERRIDES_DEFAULT_LIMIT) {
                        return res.status(400).json({ error: 'permissions limit exceeded, remove some first' });
                     }
                     const permissionOverride = {
                        allowed,
                        userID: user?.id,
                        roleID: role?.id,
                        permission,
                     } satisfies PermissionOverride;
                     await auxdibot.database.servers.update({
                        where: { serverID: guildData.id },
                        data: { permission_overrides: { push: permissionOverride } },
                     });
                     await handleLog(
                        auxdibot,
                        guild,
                        {
                           type: LogAction.PERMISSION_CREATED,
                           date_unix: Date.now(),
                           userID: req.user.id,
                           description: `${req.user.username} created a permission override. (OID: ${
                              data.permission_overrides.length + 1
                           })`,
                        },
                        [
                           {
                              name: `Permission Override (OID: ${data.permission_overrides.length + 1})`,
                              value: `${allowed ? '✅' : '❎'} \`${permissionOverride.permission}\` - ${
                                 permissionOverride.roleID
                                    ? `<@&${permissionOverride.roleID}>`
                                    : permissionOverride.userID
                                    ? `<@${permissionOverride.userID}>`
                                    : ''
                              }`,
                              inline: false,
                           },
                        ],
                     );
                     return res.json(permissionOverride);
                  });
            } catch (x) {
               console.log(x);
               return res.status(500).json({ error: 'an error occurred' });
            }
         },
      );
   router.route('/:serverID/permissions/:id').delete(
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
            .findFirst({ where: { serverID: serverID }, select: { permission_overrides: true } })
            .then(async (data) => {
               if (!data) return res.status(404).json({ error: "couldn't find that server" });
               if (data.permission_overrides.length < Number(id))
                  return res.status(400).json({ error: 'invalid id provided' });
               const permission = data.permission_overrides[Number(id)];
               data.permission_overrides.splice(Number(id), 1);
               await handleLog(auxdibot, guild, {
                  userID: req.user.id,
                  description: `Deleted permission override #${Number(id) + 1}.`,
                  type: LogAction.PERMISSION_DELETED,
                  date_unix: Date.now(),
               });
               return await auxdibot.database.servers
                  .update({
                     where: { serverID: serverID },
                     data: { permission_overrides: data.permission_overrides },
                  })
                  .then(() => res.json(permission));
            })
            .catch((x) => {
               console.error(x);
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   return router;
};
export default permissions;
