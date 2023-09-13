import { Auxdibot } from '@/interfaces/Auxdibot';
import { APIEmbed } from '@prisma/client';

export default async function setLeaveEmbed(auxdibot: Auxdibot, serverID: string, embed?: APIEmbed, text?: string) {
   return await auxdibot.database.servers
      .update({
         where: { serverID: serverID },
         data: {
            leave_embed: embed || null,
            leave_text: text || null,
         },
         select: { leave_embed: true, leave_text: true },
      })
      .catch(() => {
         throw new Error("Couldn't set that as the Leave embed!");
      });
}
