import { Auxdibot } from '@/interfaces/Auxdibot';
import { APIEmbed } from '@prisma/client';

export default async function setJoinDMEmbed(auxdibot: Auxdibot, serverID: string, embed?: APIEmbed, text?: string) {
   return await auxdibot.database.servers
      .update({
         where: { serverID: serverID },
         data: {
            join_dm_embed: embed || null,
            join_dm_text: text || null,
         },
         select: { join_dm_embed: true, join_dm_text: true },
      })
      .catch(() => {
         throw new Error("Couldn't set that as the Join DM embed!");
      });
}
