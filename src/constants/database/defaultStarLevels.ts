import { StarLevel } from '@prisma/client';

export const defaultStarLevels: StarLevel[] = [
   {
      color: 0xffe99f,
      message_reaction: '⭐',
      stars: 1,
   },
   {
      color: 0xffe180,
      message_reaction: '🌟',
      stars: 2,
   },
   {
      color: 0xffd240,
      message_reaction: '✨',
      stars: 3,
   },
   {
      color: 0xffcb20,
      message_reaction: '💫',
      stars: 4,
   },
];
