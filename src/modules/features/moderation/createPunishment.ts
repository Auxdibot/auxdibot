import { Auxdibot } from '@/interfaces/Auxdibot';
import { Punishment, PunishmentType } from '@prisma/client';
import findOrCreateServer from '@/modules/server/findOrCreateServer';
import { testLimit } from '@/util/testLimit';
import Limits from '@/constants/database/Limits';
import { BaseInteraction, EmbedBuilder, Guild, User } from 'discord.js';
import { PunishmentValues } from '@/constants/bot/punishments/PunishmentValues';
import { punishmentInfoField } from './punishmentInfoField';
import handleLog from '@/util/handleLog';

export default async function createPunishment(
   auxdibot: Auxdibot,
   guild: Guild,
   punishment: Punishment,
   interaction?: BaseInteraction,
   user?: User,
   duration?: number | 'permanent',
   deleteMessageDays?: number,
) {
   const server = await findOrCreateServer(auxdibot, guild.id);
   if (server.punishments.find((i) => i.punishmentID == punishment.punishmentID)) return undefined;
   if (testLimit(server.punishments, Limits.ACTIVE_PUNISHMENTS_DEFAULT_LIMIT, true) == 'spliced') {
      await auxdibot.database.servers.update({
         where: { serverID: server.serverID },
         data: { punishments: server.punishments },
      });
   }
   switch (punishment.type) {
      case PunishmentType.KICK:
         await interaction.guild.members.kick(user, punishment.reason || 'No reason specified.');
         break;
      case PunishmentType.BAN:
         await guild.members.ban(user, {
            reason: punishment.reason,
            deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60,
         });
         break;
      case PunishmentType.MUTE:
         const role = await guild.roles.fetch(server.mute_role).catch(() => undefined);
         const member = await guild.members.fetch({ user: user.id }).catch(() => undefined);
         if (!member) {
            throw new Error('Member is not in server!');
         }
         if (role && server.mute_role) {
            await member.roles.add(role);
         } else {
            if (!duration || !Number(duration)) {
               throw new Error('Permanent punishment date with no mute role!');
            }
            await member.timeout(duration, punishment.reason);
         }
         break;
   }
   return await auxdibot.database.servers
      .update({ where: { serverID: guild.id }, data: { punishments: { push: punishment } } })
      .then(async () => {
         const embed = new EmbedBuilder().setColor(0x9c0e11).toJSON();
         embed.title = PunishmentValues[punishment.type].name;
         embed.description = `User was ${PunishmentValues[punishment.type].action}.`;
         embed.fields = [punishmentInfoField(punishment)];
         embed.footer = {
            text: `Punishment ID: ${punishment.punishmentID}`,
         };
         await handleLog(
            auxdibot,
            interaction.guild,
            {
               userID: punishment.userID,
               description: `${user?.username || punishment.userID} was muted.`,
               date_unix: Date.now(),
               type: PunishmentValues[punishment.type].log,
            },
            [punishmentInfoField(punishment)],
            true,
         );
         if (interaction && interaction.isRepliable()) interaction.reply({ embeds: [embed] });
         return punishment;
      })
      .catch(() => undefined);
}
