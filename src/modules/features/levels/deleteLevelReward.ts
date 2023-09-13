import { Auxdibot } from '@/interfaces/Auxdibot';
import { Guild } from 'discord.js';

export default async function deleteLevelReward(auxdibot: Auxdibot, guild: Guild, id: number) {
   return auxdibot.database.servers
      .findFirst({ where: { serverID: guild.id }, select: { level_rewards: true } })
      .then(async (data) => {
         if (!data) throw new Error("couldn't find that server");
         if (data.level_rewards.length < id) throw new Error('invalid id provided');
         const levelReward = data.level_rewards[id];
         data.level_rewards.splice(id, 1);
         return await auxdibot.database.servers
            .update({
               where: { serverID: guild.id },
               data: { level_rewards: data.level_rewards },
            })
            .then(() => levelReward);
      });
}
