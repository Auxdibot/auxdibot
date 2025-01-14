import { Auxdibot } from '@/Auxdibot';
import { PunishmentType } from '@prisma/client';
import { BaseInteraction, Guild, User } from 'discord.js';
import { expirePunishment } from './expirePunishment';

export default async function expireAllPunishments(
   auxdibot: Auxdibot,
   guild: Guild,
   type: PunishmentType,
   user: User,
   interaction?: BaseInteraction,
) {
   if (!['MUTE', 'BAN'].includes(type)) return;

   const unexpired = await auxdibot.database.punishments
      .findMany({ where: { userID: user.id, type: type, expired: false } })
      .catch(() => []);
   for (let i of unexpired) {
      await expirePunishment(auxdibot, guild, i, interaction).catch(() => undefined);
   }
   return;
}
