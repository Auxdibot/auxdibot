import { Auxdibot } from '@/interfaces/Auxdibot';
import emojiRegex from 'emoji-regex';

const regex = emojiRegex();

/**
 * Validates if an emoji string is valid.
 * @param auxdibot - The Auxdibot instance.
 * @param emojiStr - The emoji string to validate.
 * @returns A boolean indicating if the emoji is valid.
 */
export function validateEmoji(auxdibot: Auxdibot, emojiStr: string): boolean {
   const emojis = emojiStr.match(regex);
   const emoji = auxdibot.emojis.cache.find((i) => i.valueOf() == emojiStr) || (emojis != null ? emojis[0] : null);
   return !!emoji;
}
