import { Auxdibot } from '@/Auxdibot';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';
import { punishments } from '@prisma/client';
import { EmbedBuilder } from 'discord.js';
import { getServerPunishments } from './getServerPunishments';

export default async function userRecordAsEmbed(auxdibot: Auxdibot, serverID: string, userID: string) {
   const embed = new EmbedBuilder().setColor(auxdibot.colors.info).toJSON();
   const record = await getServerPunishments(auxdibot, serverID, { userID });
   embed.title = '📜 Record';
   embed.description = `This is the record for <@${userID}>.\nWant to check more info about a punishment? Do \`/punishment view (id)\`.`;
   embed.fields = [
      {
         name: `Punishments`,
         value: record.reverse().reduce((str: string, punishment: punishments) => {
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
