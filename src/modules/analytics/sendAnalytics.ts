import { Auxdibot } from '@/interfaces/Auxdibot';

export default async function sendAnalytics(auxdibot: Auxdibot) {
   await auxdibot.guilds.fetch();
   const analytics = {
      servers: auxdibot.guilds.cache.size,
      members: auxdibot.guilds.cache.reduce((acc, i) => acc + i.memberCount, 0),
      commands: auxdibot.commands.reduce((acc, i) => acc + 1 + (i.subcommands?.length || 0), 0),
   };
   if (auxdibot.updateDiscordStatus)
      await auxdibot.updateDiscordStatus(analytics.servers, process.env.BOT_STATUS_MESSAGE);
   return auxdibot.database.analytics
      .upsert({
         where: { clientID: auxdibot.user.id },
         update: analytics,
         create: { clientID: auxdibot.user.id, ...analytics },
      })
      .then(() => true)
      .catch(() => false);
}
