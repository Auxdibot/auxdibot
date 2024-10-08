import { Auxdibot } from '@/Auxdibot';
import { findCommand } from '@/modules/features/commands/findCommand';
import { updateCommandPermissions } from '@/modules/features/commands/updateCommandPermissions';
import checkAuthenticated from '@/server/checkAuthenticated';
import checkGuildOwnership from '@/server/checkGuildOwnership';

import { NextFunction, Request, Response, Router } from 'express';
/*
   Commands
   Commands endpoints for Auxdibot
*/
declare module 'express-serve-static-core' {
   interface Request {
      command?: string;
      subcommand?: string[];
   }
}

function checkCommand(auxdibot: Auxdibot, req: Request, res: Response, next: NextFunction) {
   const cmdBody = req.body['command'];
   if (typeof cmdBody != 'string') return res.status(400).json({ error: 'This is not a valid command!' });
   const [command, ...subcommand] = cmdBody
      .replace(/^\//g, '')
      .split(' ')
      .filter((i) => i);
   const commandData = findCommand(auxdibot, command, subcommand ?? []);
   if (!commandData) return res.status(404).json({ error: 'Invalid command!' });

   req.command = command;
   req.subcommand = subcommand;
   return next();
}

const commands = (auxdibot: Auxdibot, router: Router) => {
   router.get(
      '/:serverID/commands',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res) => {
         return auxdibot.database.servers
            .findFirst({
               where: { serverID: req.guild.id },
               select: {
                  serverID: true,
                  command_permissions: true,
                  commands_channel: true,
               },
            })
            .then(async (data) =>
               data ? res.json({ data }) : res.status(404).json({ error: "couldn't find that server" }),
            )
            .catch(() => {
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/commands/channel',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),

      async (req, res) => {
         const channel = req.body['channel'];

         const channelData = channel
            ? await req.guild.channels.fetch(channel?.toString()).catch(() => undefined)
            : null;

         return auxdibot.database.servers
            .update({
               where: { serverID: req.guild.id },
               data: { commands_channel: channelData?.id ?? null },
            })
            .then(async (data) => {
               if (!data) return res.status(500).json({ error: 'an error occurred' });

               return res.json({ data });
            })
            .catch(() => {
               return res.status(500).json({ error: 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/commands/disable',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res, next) => checkCommand(auxdibot, req, res, next),
      (req, res) => {
         const disabled = req.body['disabled'];

         return updateCommandPermissions(auxdibot, req.guild.id, req.command, req.subcommand, {
            disabled: disabled === 'true',
         })
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );
   router.post(
      '/:serverID/commands/output_channel',
      (req, res, next) => checkAuthenticated(req, res, next),
      (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
      (req, res, next) => checkCommand(auxdibot, req, res, next),
      (req, res) => {
         const outputChannel = req.body['output_channel'];
         const channel = outputChannel ? req.guild.channels.cache.get(outputChannel) : null;

         return updateCommandPermissions(auxdibot, req.guild.id, req.command, req.subcommand, {
            channel_output: channel?.id ?? null,
         })
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
      (req, res) => {
         const outputChannel = req.body['output_channel'];
         const channel = outputChannel ? req.guild.channels.cache.get(outputChannel) : null;
         return updateCommandPermissions(auxdibot, req.guild.id, req.command, req.subcommand, {
            channel_output: channel?.id ?? null,
         })
            .then((i) => res.json({ data: i }))
            .catch((x) => {
               return res.status(500).json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
            });
      },
   );
   router
      .route('/:serverID/commands/roles')
      .patch(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res, next) => checkCommand(auxdibot, req, res, next),
         (req, res) => {
            const roleID = req.body['role'];
            const role = req.guild.roles.cache.get(roleID);
            if (!role && roleID) return res.status(404).json({ error: 'invalid role' });
            return updateCommandPermissions(auxdibot, req.guild.id, req.command, req.subcommand, {
               roles: role?.id ? [role.id] : [],
            })
               .then((i) => res.json({ data: i }))
               .catch((x) => {
                  return res
                     .status(500)
                     .json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
               });
         },
      )
      .delete(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res, next) => checkCommand(auxdibot, req, res, next),
         (req, res) => {
            const roleID = req.body['role'];
            const role = req.guild.roles.cache.get(roleID);
            if (!role && roleID) return res.status(404).json({ error: 'invalid role' });
            return updateCommandPermissions(
               auxdibot,
               req.guild.id,
               req.command,
               req.subcommand,
               {
                  roles: role?.id ? [role.id] : [],
               },
               true,
            )
               .then((i) => res.json({ data: i }))
               .catch((x) => {
                  return res
                     .status(500)
                     .json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
               });
         },
      );
   router
      .route('/:serverID/commands/blacklist_roles')
      .patch(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res, next) => checkCommand(auxdibot, req, res, next),
         (req, res) => {
            const roleID = req.body['role'];
            const role = req.guild.roles.cache.get(roleID);
            if (!role && roleID) return res.status(404).json({ error: 'invalid role' });
            return updateCommandPermissions(auxdibot, req.guild.id, req.command, req.subcommand, {
               blacklist_roles: role?.id ? [role.id] : [],
            })
               .then((i) => res.json({ data: i }))
               .catch((x) => {
                  return res
                     .status(500)
                     .json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
               });
         },
      )
      .delete(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res, next) => checkCommand(auxdibot, req, res, next),
         (req, res) => {
            const roleID = req.body['role'];
            const role = req.guild.roles.cache.get(roleID);
            if (!role && roleID) return res.status(404).json({ error: 'invalid role' });
            return updateCommandPermissions(
               auxdibot,
               req.guild.id,
               req.command,
               req.subcommand,
               {
                  blacklist_roles: role?.id ? [role.id] : [],
               },
               true,
            )
               .then((i) => res.json({ data: i }))
               .catch((x) => {
                  return res
                     .status(500)
                     .json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
               });
         },
      );
   router
      .route('/:serverID/commands/permission_bypass_roles')
      .patch(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res, next) => checkCommand(auxdibot, req, res, next),
         (req, res) => {
            const roleID = req.body['role'];
            const role = req.guild.roles.cache.get(roleID);
            if (!role && roleID) return res.status(404).json({ error: 'invalid role' });
            return updateCommandPermissions(auxdibot, req.guild.id, req.command, req.subcommand, {
               permission_bypass_roles: role?.id ? [role.id] : [],
            })
               .then((i) => res.json({ data: i }))
               .catch((x) => {
                  return res
                     .status(500)
                     .json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
               });
         },
      )
      .delete(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res, next) => checkCommand(auxdibot, req, res, next),
         (req, res) => {
            const roleID = req.body['role'];
            const role = req.guild.roles.cache.get(roleID);
            if (!role && roleID) return res.status(404).json({ error: 'invalid role' });
            return updateCommandPermissions(
               auxdibot,
               req.guild.id,
               req.command,
               req.subcommand,
               {
                  permission_bypass_roles: role?.id ? [role.id] : [],
               },
               true,
            )
               .then((i) => res.json({ data: i }))
               .catch((x) => {
                  return res
                     .status(500)
                     .json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
               });
         },
      );
   router
      .route('/:serverID/commands/channels')
      .patch(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res, next) => checkCommand(auxdibot, req, res, next),
         (req, res) => {
            const channelID = req.body['channel'];
            const channel = req.guild.channels.cache.get(channelID);
            if (!channel && channelID) return res.status(404).json({ error: 'Invalid channel.' });
            return updateCommandPermissions(auxdibot, req.guild.id, req.command, req.subcommand, {
               channels: channel?.id ? [channel.id] : [],
            })
               .then((i) => res.json({ data: i }))
               .catch((x) => {
                  return res
                     .status(500)
                     .json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
               });
         },
      )
      .delete(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res, next) => checkCommand(auxdibot, req, res, next),
         (req, res) => {
            const channelID = req.body['channel'];
            const channel = req.guild.channels.cache.get(channelID);
            if (!channel && channelID) return res.status(404).json({ error: 'Invalid channel.' });
            return updateCommandPermissions(
               auxdibot,
               req.guild.id,
               req.command,
               req.subcommand,
               {
                  channels: channel?.id ? [channel.id] : [],
               },
               true,
            )
               .then((i) => res.json({ data: i }))
               .catch((x) => {
                  return res
                     .status(500)
                     .json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
               });
         },
      );
   router
      .route('/:serverID/commands/blacklist_channels')
      .patch(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res, next) => checkCommand(auxdibot, req, res, next),
         (req, res) => {
            const channelID = req.body['channel'];
            const channel = req.guild.channels.cache.get(channelID);
            if (!channel && channelID) return res.status(404).json({ error: 'Invalid channel.' });
            return updateCommandPermissions(auxdibot, req.guild.id, req.command, req.subcommand, {
               blacklist_channels: channel?.id ? [channel.id] : [],
            })
               .then((i) => res.json({ data: i }))
               .catch((x) => {
                  return res
                     .status(500)
                     .json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
               });
         },
      )
      .delete(
         (req, res, next) => checkAuthenticated(req, res, next),
         (req, res, next) => checkGuildOwnership(auxdibot, req, res, next),
         (req, res, next) => checkCommand(auxdibot, req, res, next),
         (req, res) => {
            const channelID = req.body['channel'];
            const channel = req.guild.channels.cache.get(channelID);
            if (!channel && channelID) return res.status(404).json({ error: 'Invalid channel.' });
            return updateCommandPermissions(
               auxdibot,
               req.guild.id,
               req.command,
               req.subcommand,
               {
                  blacklist_channels: channel?.id ? [channel.id] : [],
               },
               true,
            )
               .then((i) => res.json({ data: i }))
               .catch((x) => {
                  return res
                     .status(500)
                     .json({ error: typeof x.message == 'string' ? x.message : 'an error occurred' });
               });
         },
      );
   return router;
};
export default commands;
