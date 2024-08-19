import { Auxdibot } from '@/interfaces/Auxdibot';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';
import { Punishment } from '@prisma/client';
import { EmbedBuilder } from 'discord.js';

export default async function userRecordAsEmbed(auxdibot: Auxdibot, serverID: string, userID: string) {
   const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
   const record = (await findOrCreateServer(auxdibot, serverID)).punishments.filter((p) => p.userID == userID);
   embed.title = '📜 Record';
   embed.description = `This is the record for <@${userID}>.\nWant to check more info about a punishment? Do \`/punishment view (id)\`.`;
   embed.fields = [
      {
         name: `Punishments`,
         value: record.reverse().reduce((str: string, punishment: Punishment) => {
            const type = PunishmentValues[punishment.type];
            return (
               str +
               `\n**${type.name}** - PID: ${punishment.punishmentID} - <t:${Math.round(
                  punishment.date.valueOf() / 1000,
               )}>`
            );
         }, '\u2800'),
      },
   ];
   return embed;
}
