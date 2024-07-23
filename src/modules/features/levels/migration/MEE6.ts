import { LevelReward, servermembers } from '@prisma/client';
import axios from 'axios';

interface MEE6LeaderboardPayload {
   readonly role_rewards: {
      rank: number;
      role: { id: string };
   }[];
   readonly players: {
      id: string;
      username: string;
      xp: string;
      level: string;
   }[];
   readonly xp_per_message: number[];
}
interface MEE6LeaderboardError {
   readonly status_code: number;
   readonly error: {
      message: string;
   };
}
type MEE6Leaderboard = MEE6LeaderboardPayload | MEE6LeaderboardError;
export async function fetchMEE6Leaderboard(data?: string) {
   const response = await axios
      .get<MEE6Leaderboard>(`https://mee6.xyz/api/plugins/levels/leaderboard/${data}`, {
         responseType: 'json',
      })
      .then((res) => res.data)
      .catch(() => ({ status_code: 500, error: { message: 'Failed to fetch MEE6 leaderboard.' } }));
   return response;
}

export async function fetchMEE6LevelRewards(guildID: string) {
   return await fetchMEE6Leaderboard(`${guildID}`).then((data) => {
      if (!data || 'status_code' in data) return;
      const { role_rewards } = data;
      return role_rewards
         ?.sort((a, b) => a.rank - b.rank)
         .map(
            ({ rank, role }) =>
               <LevelReward>{
                  level: rank,
                  roleID: role.id,
               },
         );
   });
}
export async function fetchMEE6MessageXP(guildID: string) {
   return await fetchMEE6Leaderboard(`${guildID}`).then((data) => {
      if (!data || 'status_code' in data) return;
      const { xp_per_message } = data;
      return xp_per_message;
   });
}
export async function fetchMEE6LeaderboardPage(guildID: string, page: number) {
   return await fetchMEE6Leaderboard(`${guildID}?limit=1000&page=${page}`).then((data) => {
      if (!data || 'status_code' in data) {
         console.error(data);
         throw new Error('Failed to fetch MEE6 leaderboard page.');
      }
      const { players } = data;
      return players.map(
         (player) => <servermembers>{ id: player.id, xp: parseInt(player.xp), level: parseInt(player.level) },
      );
   });
}

export async function fetchFullMEE6LeaderboardPage(guildID: string) {
   let pn = 0;
   let results: servermembers[] = [];

   while (true) {
      const page = await fetchMEE6LeaderboardPage(guildID, pn);
      results = results.concat(page);
      if (page.length < 1000) {
         break;
      }
      pn++;
      await new Promise((resolve) => setTimeout(resolve, 1000));
   }
   return {
      players: results,
      role_rewards: await fetchMEE6LevelRewards(guildID),
      xp_per_message: await fetchMEE6MessageXP(guildID),
   };
}
