import { FeedType } from '@prisma/client';
import { CustomEmojis } from '../CustomEmojis';

export const FeedNames: { [k in FeedType]: string } = {
   TWITCH: `${CustomEmojis.TWITCH} Twitch`,
   YOUTUBE: `${CustomEmojis.YOUTUBE} YouTube`,
   RSS: 'RSS Feed',
};
