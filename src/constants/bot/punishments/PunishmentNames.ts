import { PunishmentType } from '@prisma/client';

export const PunishmentNames: { [k in PunishmentType]: { name: string; action: string; title: string } } = {
   DELETE_MESSAGE: {
      name: '🗑️ Message Deleted',
      title: 'Delete Message',
      action: 'message deleted',
   },
   WARN: {
      name: '⚠ Warn',
      title: 'Warn User',
      action: 'warned',
   },
   MUTE: {
      name: '🔇 Mute',
      title: 'Mute User',
      action: 'muted',
   },
   KICK: {
      name: '🚷 Kick',
      title: 'Kick User',
      action: 'kicked',
   },
   BAN: {
      name: '🔨 Ban',
      title: 'Ban User',
      action: 'banned',
   },
};
