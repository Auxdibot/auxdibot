import { PunishmentType } from '@prisma/client';

export const PunishmentNames: { [k in PunishmentType]: { name: string; action: string } } = {
   DELETE_MESSAGE: {
      name: '🗑️ Message Deleted',
      action: 'message deleted',
   },
   WARN: {
      name: '⚠ Warn',
      action: 'warned',
   },
   MUTE: {
      name: '🔇 Mute',
      action: 'muted',
   },
   KICK: {
      name: '🚷 Kick',
      action: 'kicked',
   },
   BAN: {
      name: '🔨 Ban',
      action: 'banned',
   },
};
