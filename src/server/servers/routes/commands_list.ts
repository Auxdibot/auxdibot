import { Auxdibot } from '@/Auxdibot';
import { Router } from 'express';

const commandsList = (auxdibot: Auxdibot, router: Router) => {
   router.get('/commands_list', (req, res) => {
      const moduleName = req.query['module'],
         search = req.query['search'];
      return res.json({
         commands: auxdibot.commands.reduce((acc, val, key) => {
            if (!val.subcommands || search == 'command') {
               if (!moduleName || val.info.module.name.toLowerCase() == moduleName)
                  acc.push({
                     command: key,
                     allowedDefault: val.info.allowedDefault,
                     module: val.info.module.name,
                  });
            } else {
               val.subcommands.forEach((subcommand) =>
                  (!moduleName || subcommand.info.module.name.toLowerCase() == moduleName) &&
                  (!search ||
                     search == 'subcommand' ||
                     (search == 'group' && !acc.find((i) => i.group == subcommand.group)))
                     ? acc.push({
                          group: subcommand.group,
                          subcommand: search == 'group' ? undefined : subcommand.name,
                          command: key,
                          allowedDefault: subcommand.info.allowedDefault,
                          module: subcommand.info.module.name,
                       })
                     : null,
               );
            }
            return acc;
         }, []),
      });
   });

   return router;
};
export default commandsList;
