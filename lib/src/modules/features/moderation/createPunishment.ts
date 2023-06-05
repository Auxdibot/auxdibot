import { Auxdibot } from '@/interfaces/Auxdibot';
import { Punishment } from '@prisma/client';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { testLimit } from '@/util/testLimit';
import Limits from '@/constants/database/Limits';
import { BaseInteraction, EmbedBuilder } from 'discord.js';
import { PunishmentNames } from '@/constants/bot/punishments/PunishmentNames';
import { punishmentInfoField } from './punishmentInfoField';

export default async function createPunishment(
   auxdibot: Auxdibot,
   serverID: string,
   punishment: Punishment,
   interaction?: BaseInteraction,
) {
   const server = await findOrCreateServer(auxdibot, serverID);
   if (server.punishments.find((i) => i.punishmentID == punishment.punishmentID)) return undefined;
   if (testLimit(server.punishments, Limits.ACTIVE_PUNISHMENTS_DEFAULT_LIMIT, true) == 'spliced') {
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { punishments: server.punishments },
      });
   }
   return await auxdibot.database.servers
      .update({ where: { serverID }, data: { punishments: { push: punishment } } })
      .then(() => {
         const embed = new EmbedBuilder().setColor(0x9c0e11).toJSON();
         embed.title = PunishmentNames[punishment.type].name;
         embed.description = `User was ${PunishmentNames[punishment.type].action}.`;
         embed.fields = [punishmentInfoField(punishment)];
         embed.footer = {
            text: `Punishment ID: ${punishment.punishmentID}`,
         };
         if (interaction && interaction.isRepliable()) interaction.reply({ embeds: [embed] });
         return punishment;
      })
      .catch(() => undefined);
}
