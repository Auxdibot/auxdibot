import { Auxdibot } from '@/Auxdibot';
import { APIEmbed } from '@prisma/client';

export default async function setLevelMessage(auxdibot: Auxdibot, serverID: string, embed?: APIEmbed, text?: string) {
   return await auxdibot.database.servers
      .update({
         where: { serverID: serverID },
         data: {
            level_message: { content: text || '', embed: embed || null },
         },
         select: { level_message: true },
      })
      .catch(() => {
         throw new Error("Couldn't set that as the level message!");
      });
}
