import { Auxdibot } from '@/Auxdibot';
import handleLog from '@/util/handleLog';
import { LogAction } from '@prisma/client';
import { APIRole, Guild, Role } from 'discord.js';

export default async function setMuteRole(
   auxdibot: Auxdibot,
   guild: Guild,
   user: { id: string },
   role?: Role | APIRole,
) {
   const guildRole = role ? guild.roles.cache.get(role.id) : null;
   if (guildRole) {
      await guildRole.setPermissions([], 'Clearing all permissions.').catch(() => undefined);
      guild.channels.cache.forEach((r) => {
         if (r.isDMBased() || r.isThread() || !guildRole) return;
         r.permissionOverwrites
            .create(guildRole, {
               SendMessages: false,
               SendMessagesInThreads: false,
               AddReactions: false,
               CreatePublicThreads: false,
               AttachFiles: false,
               EmbedLinks: false,
               CreatePrivateThreads: false,
               CreateInstantInvite: false,
               ChangeNickname: false,
            })
            .catch(() => undefined);
         if (r.isVoiceBased())
            r.permissionOverwrites
               .create(guildRole, {
                  Connect: false,
               })
               .catch(() => undefined);
      });
   }
   return auxdibot.database.servers
      .update({
         where: { serverID: guild.id },
         select: { mute_role: true, serverID: true },
         data: { mute_role: role?.id || null },
      })
      .then(async (i) => {
         await handleLog(auxdibot, guild, {
            type: LogAction.MUTE_ROLE_CHANGED,
            userID: user.id,
            date: new Date(),
            description: role
               ? `The Mute Role for this server has been changed to ${role.name}`
               : "Mute role has been unset. This server will now use Discord's timeout system for mutes.",
         });
         return i;
      });
}
