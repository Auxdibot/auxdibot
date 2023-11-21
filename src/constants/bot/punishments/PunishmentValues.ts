import { LogAction, PunishmentType } from '@prisma/client';

export const PunishmentValues: {
   [k in PunishmentType]: { name: string; action: string; title: string; log: LogAction };
} = {
   DELETE_MESSAGE: {
      name: '🗑️ Message Deleted',
      title: 'Delete Message',
      log: LogAction.MESSAGE_DELETED_AUTOMOD,
      action: 'message deleted',
   },
   WARN: {
      name: '⚠ Warn',
      title: 'Warn User',
      log: LogAction.WARN,
      action: 'warned',
   },
   MUTE: {
      name: '🔇 Mute',
      title: 'Mute User',
      log: LogAction.MUTE,
      action: 'muted',
   },
   KICK: {
      name: '🚷 Kick',
      title: 'Kick User',
      log: LogAction.KICK,
      action: 'kicked',
   },
   BAN: {
      name: '🔨 Ban',
      title: 'Ban User',
      log: LogAction.BAN,
      action: 'banned',
   },
};
