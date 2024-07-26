import { Auxdibot } from '@/interfaces/Auxdibot';
import { calculateLevel } from '@/modules/features/levels/calculateLevel';
import { generateLeaderboardCount } from '@/modules/features/levels/generateLeaderboardCount';
import generateLevelLeaderboard from '@/modules/features/levels/generateLevelLeaderboard';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import calcXP from '@/util/calcXP';
import { Guild } from 'discord.js';
import { Express } from 'express';
/*
   Leaderboard
   View server leaderboard info
*/

const leaderboard = (auxdibot: Auxdibot, app: Express) => {
   app.get('/leaderboard/:serverID', async (req, res) => {
      const start = req.query.start ? parseInt(req.query.start as string) : 0;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : start == 0 ? 23 : 20;
      if (isNaN(start) || isNaN(limit)) return res.status(400).json({ error: 'invalid query parameters' });
      if (limit > 1000) return res.status(400).json({ error: 'limit too high' });
      try {
         const server: Guild = await auxdibot.guilds.fetch(req.params.serverID).catch(() => undefined);
         if (!server) return res.status(404).json({ error: 'server not found' });
         const data = await findOrCreateServer(auxdibot, server.id);
         if (!data.publicize_leaderboard) return res.status(403).json({ error: 'leaderboard is private' });
         const count = await generateLeaderboardCount(auxdibot, server);
         const leaderboard = await (
            await generateLevelLeaderboard(auxdibot, data.serverID, limit, start)
         ).reduce(async (acc, i) => {
            const user = await auxdibot.users.fetch(i.userID).catch(() => undefined);
            if (!user) return acc;
            const level = calculateLevel(i.xp);
            return [
               ...(await acc),
               {
                  user,
                  level: calculateLevel(i.xp),
                  xp: i.xp,
                  in_server: i.in_server,
                  xpTill: Math.round(i.xp - calcXP(level)),
                  nextLevelXP: Math.round(calcXP(level + 1) - calcXP(level)),
               },
            ];
         }, Promise.resolve([]));
         return res.status(200).json({
            server: {
               name: server.name,
               icon_url: server.iconURL({ size: 256 }),
               members: server.memberCount,
               acronym: server.nameAcronym,
               banner_url: server.bannerURL({ size: 2048 }),
            },
            leaderboard: leaderboard,
            total: count,
         });
      } catch (x) {
         console.error(x);
         return res.status(500).json({ error: 'an error occurred' });
      }
   });

   return app;
};
export default leaderboard;
