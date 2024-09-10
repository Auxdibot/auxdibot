import { Auxdibot } from '@/interfaces/Auxdibot';

export default async function fetchAnalytics(auxdibot: Auxdibot) {
   await auxdibot.guilds.fetch().catch(() => null);
   const analytics = {
      servers: auxdibot.guilds.cache.size,
      members: auxdibot.guilds.cache.reduce((acc, i) => acc + i.memberCount, 0),
      commands: auxdibot.commands.reduce((acc, i) => acc + 1 + (i.subcommands?.length || 0), 0),
   };
   if (auxdibot.updateDiscordStatus)
      await auxdibot.updateDiscordStatus(analytics.servers, process.env.BOT_STATUS_MESSAGE);
   return analytics;
}
