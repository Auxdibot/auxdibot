import { Auxdibot } from '@/interfaces/Auxdibot';
import { APIEmbed } from '@prisma/client';

export default async function setJoinEmbed(auxdibot: Auxdibot, serverID: string, embed?: APIEmbed, text?: string) {
   return await auxdibot.database.servers
      .update({
         where: { serverID: serverID },
         data: {
            join_embed: embed || null,
            join_text: text || null,
         },
         select: { join_embed: true, join_text: true },
      })
      .catch(() => {
         throw new Error("Couldn't set that as the Join embed!");
      });
}
